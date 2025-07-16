class Hero {
    constructor(id, name, alias, city, team, golpeBasico1, golpeBasico2, golpeBasico3, danoCrit, probCrit, nombreHabilidad, danoHabilidad, poder, defensa, vida = 100) {
        this.id = id;
        this.name = name;
        this.alias = alias;
        this.city = city;
        this.team = team;
        this.golpeBasico1 = golpeBasico1;
        this.golpeBasico2 = golpeBasico2;
        this.golpeBasico3 = golpeBasico3;
        this.danoCrit = danoCrit;
        this.probCrit = probCrit;
        this.nombreHabilidad = nombreHabilidad;
        this.danoHabilidad = danoHabilidad;
        this.poder = poder;
        this.defensa = defensa;
        this.vida = vida;
    }
}

export default Hero;
