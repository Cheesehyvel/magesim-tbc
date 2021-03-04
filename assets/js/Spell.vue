<script>
    export default {
        methods: {
            canCast(spell) {
                return this.state.mana >= this.manaCost(spell);
            },

            hitSpell(spell) {
                var chance = this.hitChance(spell);
                var roll = _.random(0, 100, true);
                return roll <= chance;
            },

            critSpell(spell) {
                var chance = this.critChance(spell);
                var roll = _.random(0, 100, true);
                return roll <= chance;
            },

            spellDmg(spell) {
                var dmg = _.random(spell.min_dmg, spell.max_dmg);
                dmg+= this.stats.sp;

                if (spell.school == "arcane")
                    dmg+= this.stats.sp_arcane;
                if (spell.school == "frost")
                    dmg+= this.stats.sp_frost;

                if (this.state.buffs.arcane_madness)
                    dmg+= 70;
                if (this.state.buffs.silver_crescent)
                    dmg+= 155;
                if (this.state.buffs.serpent_coil)
                    dmg+= 225;

                if (spell.key == "arcane_blast" && this.settings.items.t5_2set)
                    dmg*= 1.2;

                dmg*= spell.sp_coeff * this.dmgMultiplier(spell);

                return dmg;
            },

            manaCost(spell) {
                if (this.state.buffs.clearcast)
                    return 0;

                var cost = spell.cost;
                var multi = 1;

                if (spell.key == "arcane_blast") {
                    if (this.state.buffs.arcane_blast)
                        multi+= 0.75*this.state.buffs.arcane_blast;
                    if (this.settings.items.t5_2set)
                        multi+= 0.2;
                }

                if (spell.school == "frost" && this.talents.frost_channeling)
                    multi-= this.talents.frost_channeling*0.05;

                if (this.state.buffs.arcane_power)
                    multi+= 0.3;

                cost*= multi;

                return Math.round(cost);
            },

            castTime(spell) {
                var t = spell.cast_time;

                if (spell.key == "arcane_blast" && this.state.buffs.arcane_blast)
                    t-= (this.state.buffs.arcane_blast/3);

                if (spell.key == "frostbolt" && this.talents.imp_frostbolt)
                    t-= this.talents.imp_frostbolt*0.1;

                t*= this.castHaste();

                return t;
            },

            castHaste() {
                var t = 1;

                if (this.stats.haste)
                    t*= (100 - this.stats.haste)/100;

                if (this.state.buffs.bloodlust)
                    t*= 0.7;
                if (this.state.buffs.icy_veins)
                    t*= 0.8;

                return t;
            },

            hitChance(spell) {
                var hit = 83 + this.stats.hit;

                if (spell.school == "arcane" && this.talents.arcane_focus)
                    hit+= this.talents.arcane_focus*2;
                if (spell.school == "frost" && this.talents.elemental_precision)
                    hit+= this.talents.elemental_precision;

                return hit;
            },

            critChance(spell) {
                var crit = this.stats.crit;

                if (spell.key == "arcane_blast" && this.talents.arcane_impact)
                    crit+= this.talents.arcane_impact*2;

                if (this.state.buffs.clearcast && this.talents.arcane_potency)
                    crit+= this.talents.arcane_potency * 10;

                if (this.settings.debuffs.judgement_of_the_crusader)
                    crit+= 3;
                if (this.settings.buffs.moonkin_aura)
                    crit+= 5;

                return crit;
            },

            critMultiplier(spell) {
                var multi = 1.5;

                if (this.talents.spell_power)
                    multi+= this.talents.spell_power*0.125;

                if (this.settings.items.chaotic_skyfire)
                    multi+= 0.03;

                if (spell.school == "frost" && this.talents.ice_shards)
                    multi+= this.talents.ice_shards * 0.1;

                return multi;
            },

            dmgMultiplier(spell) {
                var multi = 1;

                if (this.settings.debuffs.misery)
                    multi*= 1.05;
                if (this.settings.debuffs.curse_of_elements)
                    multi*= 1.1;

                if (this.talents.arcane_instability)
                    multi*= 1 + (this.talents.arcane_instability * 0.01);

                if (this.state.buffs.arcane_power)
                    multi*= 1.3;

                return multi;
            },
        }
    }
</script>