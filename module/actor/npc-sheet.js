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
      dragDrop: [{dragSelector: ".item-list .item .spell .kungfu .supernatural", dropSelector: null}]
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

}
