<script>
    export default {
        data() {
            return {
                input_stats: {
                    int: 465,
                    spi: 285,
                    crit: 20,
                    hit: 6,
                    haste: 0,
                    sp: 1000,
                    sp_arcane: 50,
                    sp_frost: 0,
                },
            };
        },

        computed: {
            spiritRegenPerSecond() {
                return 0.001 + this.stats.spi*0.009327 * Math.sqrt(this.stats.int);
            },

            manaPercent() {
                return this.state.mana / this.maxMana * 100;
            },

            manaPerSecond() {
                var mps = 0;

                if (this.settings.buffs.blessing_of_wisdom)
                    mps+= 49/5;
                if (this.settings.buffs.mana_spring)
                    mps+= 50/5;

                return mps;
            },

            totalManaPerSecond() {
                var mps =  this.manaPerSecond;

                var factor = 0;
                if (this.talents.arcane_meditation)
                    factor+= this.talents.arcane_meditation * 0.1;
                if (this.settings.buffs.mage_armor)
                    factor+= 0.3;
                if (this.state.buffs.innervate)
                    factor = 4;
                mps+= factor * this.spiritRegenPerSecond;

                return mps;
            },

            totalManaPerTick() {
                return this.totalManaPerSecond * 2;
            },

            stats() {
                var stats = _.cloneDeep(this.input_stats);

                // Attributes additions
                if (this.settings.buffs.arcane_intellect)
                    stats.int+= 40;
                if (this.settings.buffs.divine_spirit)
                    stats.spi+= 40;
                if (this.settings.consumes.elixir_of_draenic_wisdom) {
                    stats.int+= 30;
                    stats.spi+= 30;
                }
                if (this.settings.buffs.mark_of_the_wild) {
                    stats.int+= 18;
                    stats.spi+= 18;
                }

                // Attribute multipliers
                if (this.talents.arcane_mind)
                    stats.int*= 1 + this.talents.arcane_mind*0.03;
                if (this.race == "gnome")
                    stats.int*= 1.05;
                if (this.race == "human")
                    stats.spi*= 1.1;
                if (this.settings.buffs.blessing_of_kings) {
                    stats.int*= 1.1;
                    stats.spi*= 1.1;
                }
                stats.int = Math.round(stats.int);
                stats.spi = Math.round(stats.spi);

                // Spell power
                stats.sp+= Math.round(stats.int * (this.talents.mind_mastery*0.05 + (this.settings.buffs.spellfire_set ? 1 : 0)*0.07));
                if (this.settings.buffs.improved_divine_spirit)
                    stats.sp+= stats.spi*0.1;
                if (this.settings.buffs.wrath_of_air)
                    stats.sp+= 102;
                if (this.settings.consumes.brilliant_wizard_oil)
                    stats.sp+= 36;
                if (this.settings.consumes.spell_dmg_food)
                    stats.sp+= 23;
                if (this.settings.consumes.flask_of_supreme_power)
                    stats.sp+= 70;
                if (this.settings.consumes.flask_of_blinding_light)
                    stats.sp_arcane+= 80;
                if (this.settings.consumes.adepts_elixir)
                    stats.sp+= 24;

                // Spell crit
                var critrating = 0;
                if (this.settings.debuffs.judgement_of_the_crusader)
                    stats.crit+= 3;
                if (this.settings.buffs.moonkin_aura)
                    stats.crit+= 5;
                if (this.settings.buffs.totem_of_wrath)
                    stats.crit+= 3;
                if (this.settings.buffs.molten_armor)
                    stats.crit+= 3;
                if (this.settings.buffs.adepts_elixir)
                    critrating+= 24;
                if (this.settings.buffs.brilliant_wizard_oil)
                    critrating+= 14;
                if (this.critrating)
                    stats.crit+= this.critRatingToChance(critrating);
                if (this.talents.arcane_instability)
                    stats.crit+= 3;

                // Spell hit
                if (this.settings.buffs.totem_of_wrath)
                    stats.hit+= 3;

                return stats;
            },

            talents() {
                var talents = {
                    arcane_focus: 0,
                    arcane_impact: 0,
                    arcane_instability: 0,
                    clearcast: 0,
                    arcane_meditation: 0,
                    arcane_potency: 0,
                    arcane_mind: 0,
                    spell_power: 0,
                    presence_of_mind: 0,
                    arcane_power: 0,
                    mind_mastery: 0,
                    elemental_precision: 0,
                    imp_frostbolt: 0,
                    icy_veins: 0,
                    cold_snap: 0,
                    ice_shards: 0,
                    piercing_ice: 0,
                    frost_channeling: 0,
                };

                if (this.settings.spec == "arcane") {
                    _.assign(talents, {
                        arcane_focus: 5,
                        arcane_impact: 3,
                        arcane_instability: 3,
                        clearcast: 5,
                        arcane_meditation: 3,
                        arcane_potency: 3,
                        arcane_mind: 5,
                        spell_power: 2,
                        presence_of_mind: 1,
                        arcane_power: 1,
                        mind_mastery: 5,
                        elemental_precision: 3,
                        imp_frostbolt: 5,
                        icy_veins: 1,
                        cold_snap: 1,
                        ice_shards: 5,
                        piercing_ice: 3,
                        frost_channeling: 3,
                    });
                }

                return talents;
            },

            maxMana() {
                var mana = this.default_state.mana;

                mana+= this.stats.int*15;

                return mana;
            },
        }
    }
</script>