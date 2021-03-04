<template>
    <div id="app">
        <div class="main">
            <div class="actions">
                <div class="btn" @click="settingsToggle" :class="[is_running ? 'disabled' : '']">Settings</div>
                <div class="btn" @click="runSingle" :class="[is_running ? 'disabled' : '']">Run</div>
                <div class="btn" @click="runBulk(200)" :class="[is_running ? 'disabled' : '']">Run (200)</div>
            </div>
            <template v-if="bulk.n">
                <div class="stats mt-2" v-if="state.t">
                    <div>Damage: {{ round(bulk.avg_dmg) }} ({{ bulk.min_dmg }} - {{ bulk.max_dmg }})</div>
                    <div>DPS: {{ round(bulk.avg_dmg/state.t) }} ({{ round(bulk.min_dmg/state.t) }} - {{ round(bulk.max_dmg/state.t) }})</div>
                </div>
            </template>
            <template v-else>
                <div class="stats mt-2" v-if="state.t">
                    <div>Damage: {{ state.dmg }}</div>
                    <div>DPS: {{ (state.dmg/state.t) }}</div>
                    <div>Mana: {{ round(state.mana) }} / {{ maxMana }}</div>
                </div>
                <div class="log mt-1" v-if="state.log">
                    <div class="form-item">
                        <label><input type="checkbox" v-model="log_filter.mana_ticks"> Show mana ticks</label>
                    </div>
                    <div class="log-wrapper">
                        <table>
                            <thead>
                                <th>T</th>
                                <th>Mana</th>
                                <th>DPS</th>
                                <th>Event</th>
                            </thead>
                            <tbody>
                                <tr v-for="log in state.log" v-if="showLog(log)">
                                    <td>{{ timeFormat(log.t) }}</td>
                                    <td>{{ round(log.mana) }} ({{ round(log.mana / maxMana * 100) }}%)</td>
                                    <td>{{ round(log.dmg/log.t) }}</td>
                                    <td :class="[log.class ? log.class : '']">{{ log.text }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </template>
        </div>

        <div class="settings" v-if="settings_open">
            <div class="fieldsets">
                <fieldset>
                    <legend>Basics</legend>
                    <div class="form-item">
                        <label>Race</label>
                        <select v-model="settings.race">
                            <option value="blood_elf">Blood elf</option>
                            <option value="draenei">Draenei</option>
                            <option value="gnome">Gnome</option>
                            <option value="human">Human</option>
                            <option value="troll">Troll</option>
                            <option value="undead">Undead</option>
                        </select>
                    </div>
                    <div class="form-item">
                        <label>Spec</label>
                        <select v-model="settings.spec">
                            <option value="arcane">Arcane</option>
                        </select>
                    </div>
                    <div class="form-item">
                        <label>Fight duration (sec)</label>
                        <input type="input" v-model="settings.duration">
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Stats without talents</legend>
                    <div class="form-item">
                        <label>Intellect</label>
                        <input type="input" v-model.number="input_stats.int">
                    </div>
                    <div class="form-item">
                        <label>Spirit</label>
                        <input type="input" v-model="input_stats.spi">
                    </div>
                    <div class="form-item">
                        <label>Critical Strike %</label>
                        <input type="input" v-model="input_stats.crit">
                    </div>
                    <div class="form-item">
                        <label>Hit %</label>
                        <input type="input" v-model="input_stats.hit">
                    </div>
                    <div class="form-item">
                        <label>Haste %</label>
                        <input type="input" v-model="input_stats.haste">
                    </div>
                    <div class="form-item">
                        <label>Spell Power</label>
                        <input type="input" v-model="input_stats.sp">
                    </div>
                    <div class="form-item">
                        <label>Extra Arcane Spell Power</label>
                        <input type="input" v-model="input_stats.sp_arcane">
                    </div>
                    <div class="form-item">
                        <label>Extra Frost Spell Power</label>
                        <input type="input" v-model="input_stats.sp_frost">
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Debuffs</legend>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.debuffs.misery"> Misery</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.debuffs.curse_of_elements"> Curse of Elements</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.debuffs.judgement_of_the_crusader"> Imp. Judgement of the Crusader</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.debuffs.judgement_of_wisdom"> Judgement of Wisdom</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.debuffs.vampiric_touch"> Vampiric Touch</label>
                    </div>
                    <div class="form-item" v-if="settings.debuffs.vampiric_touch">
                        <label>Vampiric Touch mana/sec</label>
                        <input type="input" v-model="settings.vampiric_touch_regen">
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Buffs</legend>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.buffs.arcane_intellect"> Arcane Intellect</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.buffs.mage_armor" @input="dontStack($event, 'buffs.molten_armor')"> Mage Armor</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.buffs.molten_armor" @input="dontStack($event, 'buffs.mage_armor')"> Molten Armor</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.buffs.divine_spirit"> Divine Spirit</label>
                    </div>
                    <div class="form-item" v-if="settings.buffs.divine_spirit">
                        <label><input type="checkbox" v-model="settings.buffs.improved_divine_spirit"> Imp. Divine Spirit</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.buffs.mark_of_the_wild"> Mark of the Wild</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.buffs.totem_of_wrath"> Totem of Wrath</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.buffs.wrath_of_air"> Wrath of Air Totem</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.buffs.mana_spring"> Mana Spring Totem</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.buffs.blessing_of_kings"> Blessing of Kings</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.buffs.blessing_of_wisdom"> Blessing of Wisdom</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.buffs.moonkin_aura"> Moonkin Aura</label>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Cooldowns</legend>
                    <div class="form-item">
                        <label>Personal CDs at</label>
                        <input type="input" v-model="settings.behavior.cooldowns_at">
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.cooldowns.bloodlust"> Bloodlust</label>
                    </div>
                    <div class="form-item" v-if="settings.cooldowns.bloodlust">
                        <label>Bloodlust at</label>
                        <input type="input" v-model="settings.behavior.bloodlust_at">
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.cooldowns.mana_tide"> Mana Tide Totem</label>
                    </div>
                    <div class="form-item" v-if="settings.cooldowns.mana_tide">
                        <label>Mana Tide at</label>
                        <input type="input" v-model="settings.behavior.mana_tide_at">
                    </div>
                    <div class="form-item">
                        <label>Innervates</label>
                        <input type="input" v-model="settings.cooldowns.innervate">
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Consumes</legend>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.consumes.spell_dmg_food" @input="dontStack($event, 'consumes.spell_crit_food')"> Spell damage food</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.consumes.spell_crit_food" @input="dontStack($event, 'consumes.spell_dmg_food')"> Spell crit food</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.consumes.brilliant_wizard_oil"> Brilliant Wizard Oil</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.consumes.flask_of_supreme_power" @input="dontStack($event, ['consumes.flask_of_blinding_light', 'consumes.adepts_elixir', 'consumes.elixir_of_draenic_wisdom'])"> Flask of Supreme Power</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.consumes.flask_of_blinding_light" @input="dontStack($event, ['consumes.flask_of_supreme_power', 'consumes.adepts_elixir', 'consumes.elixir_of_draenic_wisdom'])"> Flask of Blinding Light</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.consumes.adepts_elixir" @input="dontStack($event, ['consumes.flask_of_supreme_power', 'consumes.flask_of_blinding_light'])"> Adept's Elixir</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.consumes.elixir_of_draenic_wisdom" @input="dontStack($event, ['consumes.flask_of_supreme_power', 'consumes.flask_of_blinding_light'])"> Elixir of Draenic Wisdom</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.consumes.drums"> Drums (WIP)</label>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Items</legend>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.items.t5_2set"> T5 2-set bonus</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.items.t5_4set"> T5 4-set bonus</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.items.serpent_coil"> Serpent Coil</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.items.silver_crescent"> Icon of the Silver Crescent</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.items.spellfire_set"> Spellfire set bonus</label>
                    </div>
                    <div class="form-item">
                        <label><input type="checkbox" v-model="settings.items.chaotic_skyfire"> Chaotic Skyfire meta gem</label>
                    </div>
                </fieldset>
            </div>
            <div class="btn mt-4" @click="settingsToggle">Close</div>
        </div>
    </div>
</template>

<script>
    import Stats from "./Stats";
    import Spell from "./Spell";
    import Spells from "./spells";

    export default {
        mixins: [Stats, Spell],

        mounted() {
            this.loadSettings();
        },

        data() {
            return {
                settings: {
                    duration: 200,
                    cast_delay: 50,
                    vampiric_touch_regen: 50,
                    debuffs: {
                        misery: true,
                        curse_of_elements: true,
                        judgement_of_the_crusader: false,
                        judgement_of_wisdom: true,
                        vampiric_touch: true,
                    },
                    buffs: {
                        totem_of_wrath: false,
                        wrath_of_air: true,
                        mana_spring: true,
                        arcane_intellect: true,
                        divine_spirit: true,
                        improved_divine_spirit: false,
                        blessing_of_kings: true,
                        blessing_of_wisdom: true,
                        mark_of_the_wild: true,
                        moonkin_aura: false,
                        mage_armor: true,
                        molten_armor: false,
                    },
                    consumes: {
                        spell_dmg_food: true,
                        spell_crit_food: false,
                        brilliant_wizard_oil: true,
                        flask_of_supreme_power: false,
                        flask_of_blinding_light: true,
                        adepts_elixir: false,
                        elixir_of_draenic_wisdom: false,
                        drums: true,
                    },
                    items: {
                        t5_2set: true,
                        t5_4set: true,
                        spellfire_set: false,
                        chaotic_skyfire: true,
                        serpent_coil: true,
                        silver_crescent: true,
                    },
                    cooldowns: {
                        innervate: 1,
                        mana_tide: true,
                        bloodlust: true,
                    },
                    behavior: {
                        regen_mana_at: 15,
                        regen_spell: "frostbolt",
                        mana_tide_at: 10,
                        bloodlust_at: 10,
                        cooldowns_at: 10,
                    },
                    race: "undead",
                    spec: "arcane",
                },
                default_state: {
                    t: 0,
                    mana: 1961,
                    dmg: 0,
                    is_casting: false,
                    used_cooldowns: false,
                    regen_cycle: 0,
                    innervates: 0,
                    mana_gems: {
                        emeralds: 3,
                        ruby: 1,
                    },
                    cooldowns: {
                        potion: false,
                        mana_gem: false,
                        evocation: false,
                        cold_snap: false,
                    },
                    buffs: {
                        arcane_madness: false,
                        arcane_power: false,
                        icy_veins: false,
                        presence_of_mind: false,
                        bloodlust: false,
                        innervate: false,
                        clearcast: false,
                        silver_crescent: false,
                        serpent_coil: false,
                        arcane_blast: 0,
                    },
                    log: [],
                },
                log_filter: {
                    mana_ticks: false,
                },
                state: {},
                queue: [],
                is_running: false,
                bulk: {
                    i: 0,
                    n: 0,
                    min_dmg: 0,
                    max_dmg: 0,
                    avg_dmg: 0,
                },
                settings_open: false,
            }
        },

        methods: {
            runBulk(n) {
                this.bulk.i = 0;
                this.bulk.n = n;
                this.run();
            },

            runSingle() {
                this.bulk.n = 0;
                this.run();
            },

            run() {
                this.state = _.cloneDeep(this.default_state);
                this.state.mana = this.maxMana;
                this.state.innervates = this.settings.cooldowns.innervate;

                this.push({
                    type: "mana_regen",
                    t: 2,
                });

                if (this.settings.debuffs.vampiric_touch) {
                    this.push({
                        type: "vampiric_touch",
                        value: this.settings.vampiric_touch_regen,
                        t: 1,
                    });
                }

                if (this.settings.cooldowns.bloodlust) {
                    this.push({
                        type: "buff_gain",
                        buff: "bloodlust",
                        t: this.settings.behavior.bloodlust_at,
                    });
                }

                if (this.settings.cooldowns.mana_tide) {
                    this.push({
                        type: "buff_gain",
                        buff: "mana_tide",
                        t: this.settings.behavior.mana_tide_at,
                    });
                }

                this.cast(this.defaultSpell());

                this.work();
            },

            work() {
                this.is_running = true;

                while (true) {
                    var event = this.queue.shift();

                    if (!event)
                        throw "Event queue is empty";

                    if (event.t >= this.settings.duration) {
                        this.state.t = this.settings.duration;
                        break;
                    }

                    this.tick(event);
                }

                this.done();
            },

            push(event) {
                event.t+= this.state.t;

                for (var i=0; i<this.queue.length; i++) {
                    if (event.t < this.queue[i].t) {
                        this.queue.splice(i, 0, event);
                        return;
                    }
                }

                this.queue.push(event);
            },

            tick(event) {
                this.state.t = event.t;

                if (event.type == "cast")
                    this.cast(event.spell);
                if (event.type == "spell")
                    this.onCast(event.spell);
                if (event.type == "mana_regen")
                    this.onManaRegen();
                if (event.type == "mana_gain")
                    this.onManaGain(event.value, event.name);
                if (event.type == "buff_gain")
                    this.onBuffGain(event.buff);
                if (event.type == "buff_expire")
                    this.onBuffExpire(event.buff);
                if (event.type == "vampiric_touch")
                    this.onVampiricTouch(event.value);
                if (event.type == "wait")
                    this.onWait();
            },

            done() {
                this.queue = [];

                if (this.bulk.n) {
                    this.bulk.i++;
                    if (this.bulk.i == 1)
                        this.bulk.min_dmg = this.bulk.max_dmg = this.bulk.avg_dmg = this.state.dmg;
                    this.bulk.min_dmg = Math.min(this.bulk.min_dmg, this.state.dmg);
                    this.bulk.max_dmg = Math.max(this.bulk.max_dmg, this.state.dmg);
                    this.bulk.avg_dmg = (this.bulk.avg_dmg*(this.bulk.i-1) + this.state.dmg)/this.bulk.i;

                    this.bulk.i++;
                    if (this.bulk.i < this.bulk.n) {
                        this.run();
                        return;
                    }
                }

                this.is_running = false;
                console.log("done");
            },

            cast(spell) {
                if (this.canCast(spell)) {
                    this.is_casting = true;
                    this.push({
                        type: "spell",
                        spell: spell,
                        t: this.castTime(spell),
                    });
                }
                else {
                    this.push({
                        type: "wait",
                        t: 1,
                    });
                    this.addLog({
                        text: "Cannot cast, waiting 1 seconds",
                        class: "error",
                    });
                }
            },

            defaultSpell() {
                if (this.settings.spec == "arcane")
                    return Spells.arcane_blast;

                throw "Could not find default spell for spec: "+this.settings.spec;
            },

            useCooldowns() {
                this.state.used_cooldowns = true;
                if (this.talents.arcane_power)
                    this.onBuffGain("arcane_power");
                if (this.talents.icy_veins)
                    this.onBuffGain("icy_veins");
                if (this.settings.items.silver_crescent)
                    this.onBuffGain("silver_crescent");

                // TODO: Presence of mind
            },

            useColdSnap() {
                this.state.cooldowns.cold_snap = true;
                if (this.talents.icy_veins)
                    this.onBuffGain("icy_veins");
            },

            onBuffGain(key) {
                var log = 1;

                if (key == "arcane_blast") {
                    var index = _.findIndex(this.queue, {type: "buff_expire", buff: "arcane_blast"});
                    if (index != -1)
                        this.queue.splice(index, 1);

                    if (this.state.buffs.arcane_blast < 3) {
                        this.state.buffs.arcane_blast++;
                        log = this.state.buffs.arcane_blast;
                    }
                    else {
                        log = false;
                    }

                    this.push({
                        type: "buff_expire",
                        buff: "arcane_blast",
                        t: 8
                    });
                }

                if (key == "arcane_madness") {
                    this.state.buffs.arcane_madness = true;

                    var index = _.findIndex(this.queue, {
                        type: "buff_expire",
                        buff: "arcane_madness",
                    });
                    if (index != -1)
                        this.queue.splice(index, 1);

                    this.push({
                        type: "buff_expire",
                        buff: "arcane_madness",
                        t: 6
                    });
                }

                if (key == "arcane_power") {
                    this.state.buffs.arcane_power = true;
                    this.push({
                        type: "buff_expire",
                        buff: "arcane_power",
                        t: 15
                    });
                }

                if (key == "icy_veins") {
                    this.state.buffs.icy_veins = true;
                    this.push({
                        type: "buff_expire",
                        buff: "icy_veins",
                        t: 20
                    });
                }

                if (key == "silver_crescent") {
                    this.state.buffs.silver_crescent = true;
                    this.push({
                        type: "buff_expire",
                        buff: "silver_crescent",
                        t: 20
                    });
                }

                if (key == "serpent_coil") {
                    this.state.buffs.serpent_coil = true;
                    this.push({
                        type: "buff_expire",
                        buff: "serpent_coil",
                        t: 15
                    });
                }

                if (key == "clearcast") {
                    this.state.buffs.clearcast = true;
                }

                if (key == "bloodlust") {
                    this.state.buffs.bloodlust = true;
                    this.push({
                        type: "buff_expire",
                        buff: "bloodlust",
                        t: 40
                    });
                }

                if (key == "innervate") {
                    this.state.buffs.innervate = true;
                    this.push({
                        type: "buff_expire",
                        buff: "innervate",
                        t: 20
                    });
                }

                if (key == "mana_tide") {
                    log = false;
                    for (var t=3; t<=12; t+=3) {
                        this.push({
                            type: "mana_gain",
                            value: this.maxMana * 0.06,
                            t: t,
                            name: "Mana Tide"
                        });
                    }
                }

                if (log) {
                    var name = key.replace(/_/g, " ");
                    name = _.upperFirst(name);
                    if (log > 1)
                        name+= " ("+log+")";
                    this.addLog("Gained "+name);
                }
            },

            onBuffExpire(key) {
                if (this.state.buffs.hasOwnProperty(key)) {
                    if (_.isNumber(this.state.buffs[key]))
                        this.state.buffs[key] = 0;
                    else
                        this.state.buffs[key] = false;

                    var name = key.replace(/_/g, " ");
                    name = _.upperFirst(name);
                    this.addLog("Lost "+name);
                }
            },

            onCast(spell) {
                var next = null;
                this.state.is_casting = false;

                if (this.canCast(spell)) {
                    var log = {text: spell.name};
                    var cost = this.manaCost(spell);
                    log.class = [spell.school];

                    this.state.mana-= cost;

                    if (this.hitSpell(spell)) {
                        var dmg = this.spellDmg(spell);
                        var is_crit = this.critSpell(spell);

                        if (is_crit) {
                            log.text+= " crits";
                            log.class.push("crit");
                            dmg*= this.critMultiplier(spell);
                        }
                        else {
                            log.text+= " hits";
                        }

                        dmg = Math.round(dmg);
                        this.state.dmg+= dmg;
                        log.text+= " for "+dmg+" damage";
                    }
                    else {
                        log.text+= " resists";
                    }

                    log.text+= " ("+cost+") ["+this.critChance(spell)+"%]";
                    this.addLog(log);

                    if (this.settings.debuffs.judgement_of_wisdom && _.random(0, 1))
                        this.onManaGain(74, "Judgement of Wisdom");

                    if (spell.key == "arcane_blast") {
                        this.onBuffGain("arcane_blast");
                        if (this.settings.items.t5_4set && is_crit)
                            this.onBuffGain("arcane_madness");
                    }

                    if (this.state.buffs.clearcast)
                        this.onBuffExpire("clearcast");
                    this.clearcast();

                    if (!this.state.used_cooldowns && this.settings.behavior.cooldowns_at <= this.state.t)
                        this.useCooldowns();
                    else if (this.state.used_cooldowns && !this.state.cooldowns.cold_snap && this.talents.cold_snap && !this.state.buffs.icy_veins)
                        this.useColdSnap();

                    if (this.shouldUseManaGem())
                        this.onManaGem();

                    if (this.shouldUseManaPotion())
                        this.onManaPotion();

                    if (this.shouldEvocate()) {
                        this.evocate();
                        return;
                    }
                    else if (this.shouldInnervate()) {
                        this.innervate();
                    }
                    else {
                        var regen_at = this.settings.behavior.regen_mana_at;
                        if (this.state.buffs.bloodlust)
                            regen_at = Math.min(regen_at, 10);

                        if (this.state.regen_cycle == 3) {
                            this.state.regen_cycle = 0;
                        }
                        else if (this.state.regen_cycle || (this.manaPercent <= regen_at && this.state.buffs.arcane_blast == 3)) {
                            next = Spells[this.settings.behavior.regen_spell];
                            this.state.regen_cycle++;
                        }
                    }
                }

                if (!next)
                    next = this.defaultSpell();

                this.cast(next);
            },

            onWait() {
                this.cast(this.defaultSpell());
            },

            onManaRegen() {
                this.onManaGain(this.totalManaPerTick);
                this.addLog({
                    text: "Regens "+_.round(this.totalManaPerTick)+" mana",
                    filter: "mana_ticks",
                });
                this.push({
                    type: "mana_regen",
                    t: 2,
                });
            },

            onManaGain(mana, name) {
                this.state.mana = Math.min(this.maxMana, this.state.mana + mana);
                if (name)
                    this.addLog("Gains "+_.round(mana)+" from "+name);
            },

            onVampiricTouch(mana) {
                this.onManaGain(mana);
                this.addLog({
                    text: "Gains "+_.round(mana)+" from Vampiric Touch",
                    filter: "mana_ticks",
                });

                this.push({
                    type: "vampiric_touch",
                    value: mana,
                    t: 1,
                });
            },

            onManaPotion() {
                this.state.cooldowns.potion = true;
                this.onManaGain(_.random(1800, 3000), "mana potion");
                this.push({
                    type: "cooldown_expire",
                    value: "potion",
                    t: 120,
                });
            },

            onManaGem() {
                var mana = 0;
                if (this.state.mana_gems.emeralds > 0) {
                    mana = _.random(2340, 2460);
                    this.state.mana_gems.emeralds--;
                }
                else if (this.state.mana_gems.ruby > 0) {
                    mana = _.random(1073, 1127);
                    this.state.mana_gems.ruby--;
                }

                if (this.settings.items.serpent_coil)
                    mana*= 1.25;

                this.state.cooldowns.mana_gem = true;
                this.onManaGain(mana, "mana gem");
                this.push({
                    type: "cooldown_expire",
                    value: "mana_gem",
                    t: 120,
                });

                if (this.settings.items.serpent_coil)
                    this.onBuffGain("serpent_coil");
            },

            onCooldownExpire(cd) {
                this.state.cooldowns[cd] = false;
            },

            buffRemaining(key) {
                var event = _.find(this.queue, {
                    type: "buff_expire",
                    buff: key
                });

                return event ? event.t : false;
            },

            innervate() {
                this.state.innervates--;
                this.state.buffs.innervate = true;
                this.onBuffGain("innervate");
            },

            evocate() {
                this.is_casting = true;
                this.state.regen_cycle = 0;
                this.state.cooldowns.evocation = true;
                var haste = this.castHaste();

                for (var i=1; i<=4; i++) {
                    this.push({
                        type: "mana_gain",
                        value: this.maxMana*0.15,
                        name: "Evocation",
                        t: i * haste * 2,
                    });
                }

                this.push({
                    type: "cast",
                    spell: this.defaultSpell(),
                    t: 8 * haste * 2,
                });
            },

            clearcast() {
                var chance = this.talents.clearcast * 2;
                var roll = _.random(0, 100, true);
                if (roll <= chance)
                    this.onBuffGain("clearcast");
            },

            hasManaTide() {
                var index = _.findIndex(this.queue, {
                    type: "mana_gain",
                    name: "mana_tide",
                });

                return index != -1;
            },

            shouldInnervate() {
                if (!this.state.innervates || this.state.buffs.innervate)
                    return false;

                if (this.manaPercent < 70 && this.state.cooldowns.potion && this.state.cooldowns.mana_gem)
                    return true;

                if (this.manaPercent < 30)
                    return true;

                return false;
            },

            shouldEvocate() {
                if (this.state.cooldowns.evocation || this.state.buffs.innervate || this.hasManaTide() || this.manaPercent > 20)
                    return false;

                if (this.state.buffs.bloodlust && this.manaPercent > 10)
                    return false;

                return true;
            },

            shouldUseManaGem() {
                if (this.state.cooldowns.mana_gem || this.state.buffs.innervate)
                    return false;

                if (this.state.mana_gems.emeralds > 0)
                    var max = 2460;
                else if (this.state.mana_gems.ruby > 0)
                    var max = 1127;
                else
                    return false;

                if (this.settings.items.serpent_coil)
                    max*= 1.25;

                if (this.hasManaTide())
                    max+= this.maxMana * 0.06;

                if (this.maxMana - this.state.mana >= max)
                    return true;

                return false;
            },

            shouldUseManaPotion() {
                if (this.state.cooldowns.potion || !this.state.cooldowns.mana_gem || this.state.buffs.innervate)
                    return false;

                var max = 3000;

                if (this.hasManaTide())
                    max+= this.maxMana * 0.06;

                if (this.maxMana - this.state.mana >= max)
                    return true;

                return false;
            },

            addLog(log) {
                if (!_.isObject(log))
                    log = {text: log};
                log.t = this.state.t;
                log.mana = this.state.mana;
                log.dmg = this.state.dmg;
                this.state.log.push(log);
            },

            settingsToggle() {
                this.settings_open = !this.settings_open;
                if (!this.settings_open)
                    this.saveSettings();
            },

            dontStack(input, settings) {
                if (!Array.isArray(settings))
                    settings = [settings];

                if (input.target.checked) {
                    for (var i=0; i<settings.length; i++) {
                        var key = settings[i];
                        if (_.get(this.settings, key)) {
                            _.set(this.settings, key, false);
                        }
                    }
                }
            },

            showLog(log) {
                if (!log.filter)
                    return true;

                return this.log_filter[log.filter];
            },

            timeFormat(s) {
                var dec = Math.round((s%1) * 100);
                var sec = Math.floor(s);
                if (dec == 100) {
                    dec = 0;
                    sec++;
                }

                return (sec < 10 ? "0"+sec : sec)+"."+(dec < 10 ? "0"+dec : dec);
            },

            round(num) {
                return Math.round(num);
            },

            critRatingToChance(rating) {
                return rating / 22.08;
            },

            hitRatingToChance(rating) {
                return rating / 12.62;
            },

            saveSettings() {
                window.localStorage.setItem("magesim_tbc_settings", JSON.stringify(this.settings));
            },

            loadSettings() {
                var str = window.localStorage.getItem("magesim_tbc_settings");
                if (str) {
                    var settings = JSON.parse(str);
                    if (settings) {
                        for (var key in settings) {
                            if (this.settings.hasOwnProperty(key))
                                this.settings[key] = settings[key];
                        }
                    }
                }
            },
        }
    }
</script>