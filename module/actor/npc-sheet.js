import {CDEActorSheet} from "./actor-sheet.js";
/**
 * @extends {CDEActorSheet}
 */
export class CDEPNJSheet extends CDEActorSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["chroniquesdeletrange", "sheet", "actor", "npc"],
      template: "systems/chroniquesdeletrange/templates/actor/npc-sheet.html",
      scrollY: [".description", ".aptitudes", ".supernaturals", ".spells", ".kungfus", ".items"],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async getData(options) {
    const context = await super.getData(options);
    context.descriptionHTML = await TextEditor.enrichHTML(this.actor.system.description, {
      secrets: this.document.isOwner,
      async: true
    });
    context.supernaturals = context.items.filter(item => item.type === "supernatural");
    context.spells = context.items.filter(item => item.type === "spell");
    context.kungfus = context.items.filter(item => item.type === "kungfu");
    context.equipments = context.items.filter(item => item.type === "item");
  return context;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);



    html.find(".click-initiative-npc").click(this._onClickNPCInitiative.bind(this));





    // Item Controls
    // html.find(".items .rollable").on("click", this._onSupernaturalRoll.bind(this));
  }
   
  /**
   * Handle click events for Item supernatural control buttons within the Actor Sheet
   * @param event
   * @private
   */

  /*
  _onSupernaturalControl(event) {
    event.preventDefault();
  */
 
  _onItemControl(event) {
    event.preventDefault();
      
    // Obtain event data
    const button = event.currentTarget;
    const action = button.dataset.action;
    const type = button.dataset.type;
    const li = button.closest(".item");
    let item;

    // Handle different actions
    switch (action) {
      case "create":
        const cls = getDocumentClass("Item");
        let name = "";
        if (type === "item") name = game.i18n.localize("CDE.ItemNew");
        else if (type === "kungfu") name = game.i18n.localize("CDE.KFNew");
        else if (type === "spell") name = game.i18n.localize("CDE.SpellNew");
        else if (type === "supernatural") name = game.i18n.localize("CDE.SupernaturalNew");
        return cls.create({ name: name, type: type }, { parent: this.actor });
      case "edit":
        item = this.actor.items.get(li?.dataset.itemId);
        return item.sheet.render(true);
      case "delete":
        item = this.actor.items.get(li?.dataset.itemId);
        return item.delete();
    }
  }


  /* -------------------------------------------- */

  /**
   * Listen for roll buttons on items.
   * @param {MouseEvent} event    The originating left click event
   */
  _onItemRoll(event) {
    let button = $(event.currentTarget);
    const li = button.parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    let r = new Roll(button.data('roll'), this.actor.getRollData());
    return r.toMessage({
      
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3>`
    });
  }




 /* _onKungFuRoll(event) {
    let button = $(event.currentTarget);
    const li = button.parents(".kungfu");
    const item = this.actor.items.get(li.data("itemId"));
    let r = new Roll(button.data('roll'), this.actor.getRollData());
    return r.toMessage({
      
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3>`
    });
  } */


 /*  _onSpellRoll(event) {
    let button = $(event.currentTarget);
    const li = button.parents(".spell");
    const item = this.actor.items.get(li.data("itemId"));
    let r = new Roll(button.data('roll'), this.actor.getRollData());
    return r.toMessage({
      
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3>`
    });
  } */

  /**
   * Listen for click on NPC Initiative.
   * @param {MouseEvent} event    The originating left click event
   */
  async _onClickNPCInitiative (event) {
    // Render modal dialog
    const element = event.currentTarget;                        // On récupère le clic
    const whatIsIt = element.dataset.libelId;
    console.log("whatIsIt = ", whatIsIt);

    console.log("on gère l'inititive d'un NPC !")

    const myActor = this.actor;
  
    let initiative = myActor.system.initiative;

    if (whatIsIt == "plus") {
      initiative++;
      if (initiative > 24) initiative = initiative - 24;
      myActor.update({ "system.initiative": initiative });
      return;
    } else if (whatIsIt == "minus") {
      initiative--;
      if (initiative < 1) initiative = 24 - initiative;
      myActor.update({ "system.initiative": initiative });
      return;
    }

    if (whatIsIt != "create") return;

    const template = 'systems/chroniquesdeletrange/templates/form/turn-order-npc-prompt.html';
    const title = game.i18n.localize("CDE.TurnOrder");
    let dialogOptions = "";
    var dialogData = {
      speciality: "0",
    };
    console.log("Gear dialogData = ", dialogData);
    const html = await renderTemplate(template, dialogData);

    // Create the Dialog window
    let prompt = await new Promise((resolve) => {
      new Dialog(
        {
          title: title,
          content: html,
          buttons: {
            validateBtn: {
              icon: `<div class="tooltip"><i class="fas fa-check"></i>&nbsp;<span class="tooltiptextleft">${game.i18n.localize('CDE.Validate')}</span></div>`,
              callback: (html) => resolve( dialogData = _computeResult(dialogData, html) )
            },
            cancelBtn: {
              icon: `<div class="tooltip"><i class="fas fa-cancel"></i>&nbsp;<span class="tooltiptextleft">${game.i18n.localize('CDE.Cancel')}</span></div>`,
              callback: (html) => resolve(null)
            }
          },
          default: 'validateBtn',
          close: () => resolve(null)
        },
        dialogOptions
      ).render(true, {
        width: 550,
        // height: 125
        height: "auto"
      });
    });

    if (prompt == null){return};
    console.log('prompt : ', prompt);
    const speciality = parseInt(dialogData.speciality);

    const physical = myActor.system.aptitudes.physical.value;
    let theOther;

    switch (speciality) {
      case 0: theOther = myActor.system.aptitudes.physical.value;
      break;
      case 1: theOther = myActor.system.aptitudes.martial.value;
      break;
      case 2: theOther = myActor.system.aptitudes.mental.value;
      break;
      case 3: theOther = myActor.system.aptitudes.social.value;
      break;
      case 4: theOther = myActor.system.aptitudes.spiritual.value;
      break;
      default: theOther = -999;                     
    }

    initiative = physical + theOther;
    myActor.update({ "system.initiative": initiative });

    function _computeResult(myDialogData, myHtml) {
      console.log("J'exécute bien _computeResult()");
      myDialogData.speciality = myHtml.find("select[name='speciality']").val();
      return myDialogData;
    };


   }


}
