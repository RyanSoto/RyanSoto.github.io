class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = {}; // live objects are in here
    this.configObjects = config.configObjects; // configuration content


    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isPaused = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(0) - cameraPerson.x, 
      utils.withGrid(0) - cameraPerson.y
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(0) - cameraPerson.x, 
      utils.withGrid(0) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    if (this.walls[`${x},${y}`]) {
      return true;
    }
    //Check for game objects at this position
    return Object.values(this.gameObjects).find(obj => {
      if (obj.x === x && obj.y === y) { return true; }
      if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition && obj.intentPosition[1] === y) {
        return true;
      }
      return false;
    })
  }

  mountObjects() {
    Object.keys(this.configObjects).forEach(key => {

      let object = this.configObjects[key];
      object.id = key;

      let instance;
      if (object.type == "Hero") {
        instance = new Hero(object);
      }
      if (object.type == "Person") {
        instance = new Person(object);
      }
      if (object.type === "Delivery") {
        instance = new Delivery(object);
      }
      if (object.type === "Destination") {
        instance = new Destination(object);
      }
      if (object.type === "BigSign") {
        instance = new BigSign(object);
      }

      

      this.gameObjects[key] = instance; 
      this.gameObjects[key].id = key;
      instance.mount(this);

      //TODO: determine if this object should actually mount
      //object.mount(this);

    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    //reset npcs to do their idle behavior
    //Object.values(this.configObjects).forEach(object => object.doBehaviorEvent(this))


  }


  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {

      const relevantScenario = match.talking.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene( match[0].events )
    }
  }



}

window.OverworldMaps = {
  Starville: {
    id: "Starville",
    lowerSrc: "/images/maps/Anywhere1.png",
    upperSrc: "/images/maps/AnywhereUpper.png",
    configObjects: {
      hero: {
        type: "Hero",
        useShadow: true,
        isPlayerControlled: true,
        x: utils.withGrid(12),
        y: utils.withGrid(23),
      },
      npc1: {
        type:"Person",
        useShadow: true,
        x: utils.withGrid(26),
        y: utils.withGrid(21),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand",  direction: "left", time: 800 },
          { type: "stand",  direction: "up", time: 800 },
          { type: "stand",  direction: "right", time: 1200 },
          { type: "stand",  direction: "down", time: 300 },
        ],
        talking: [
          {
            events: [
              {type: "textMessage", text: "I heard this interactive resume was originally going to be a game", faceHero: "npc1"},
              {type: "textMessage", text: "He instead turned his hobby into a profession."},
              // {who: "hero", type: "walk", direction: "down"},
            ]
          }
        ]
      },
      npc2: {
        type:"Person",
        useShadow: true,
        x: utils.withGrid(10),
        y: utils.withGrid(21),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          {type: "stand", direction: "up", time: 800},
          {type: "walk", direction: "up"},
          {type: "stand", direction: "up", time: 1600},
          {type: "walk", direction: "down"},
          {type: "stand", direction: "down", time:1200},
        ],
        talking: [
          {
            events: [
              {type: "textMessage", text: "If you press Q, the original game idea is revealed", faceHero: "npc2"},
              // {type: "textMessage", text: "You can accept an order and fulfill the delivery."},
            ]
          }
        ]
      },
        BigSign0: ({
        type: "BigSign",
        src: "images/Objects/bigsign1left.png",
        x: utils.withGrid(47), //19
        y: utils.withGrid(22), //35
        // storyFlag: "HAVEREAD",

      }),
      BigSign1: ({
        type: "BigSign",
        src: "images/Objects/bigsign1right.png",
        x: utils.withGrid(48), //19
        y: utils.withGrid(22), //35
        // storyFlag: "HAVEREAD",

      }),
      pickUp0: ({
        type: "Delivery",
        x: utils.withGrid(64), //64
        y: utils.withGrid(19), //19
        storyFlag: "PICKUP_0"
      }),
      pickUp1: ({
        type: "Delivery",
        x: utils.withGrid(67), //19
        y: utils.withGrid(32), //35
        storyFlag: "PICKUP_1"
      }),
      pickUp2: ({
        type: "Delivery",
        x: utils.withGrid(76), //19
        y: utils.withGrid(19), //35
        storyFlag: "PICKUP_2"
      }),
      pickUp3: ({
        type: "Delivery",
        x: utils.withGrid(83), //19
        y: utils.withGrid(33), //35
        storyFlag: "PICKUP_3"
      }),
      pickUp4: ({
        type: "Delivery",
        x: utils.withGrid(85), //19
        y: utils.withGrid(16), //35
        storyFlag: "PICKUP_4"
      }),
      dropOff0: ({
        type: "Destination",
        x: utils.withGrid(19), //65
        y: utils.withGrid(35), //19
        storyFlag: "DROPOFF_0"
      }),
      dropOff1: ({
        type: "Destination",
        x: utils.withGrid(36), //65
        y: utils.withGrid(21), //19
        storyFlag: "DROPOFF_1"
      }),
      dropOff2: ({
        type: "Destination",
        x: utils.withGrid(27), //65
        y: utils.withGrid(21), //19
        storyFlag: "DROPOFF_2"
      }),
      dropOff3: ({
        type: "Destination",
        x: utils.withGrid(30), //65
        y: utils.withGrid(35), //19
        storyFlag: "DROPOFF_3"
      }),

    },
    walls: {
      [utils.asGridCoord(28,20)] : true,
      [utils.asGridCoord(27,20)] : true,
      [utils.asGridCoord(26,20)] : true,
      [utils.asGridCoord(25,20)] : true,
      [utils.asGridCoord(23,20)] : true,
    },

    cutsceneSpaces: {
      [utils.asGridCoord(24,20)]: [
        {
          events: [

            { who: "npc1", type: "walk", direction: "left" },
            { who: "npc1", type: "walk", direction: "left" },
            { who: "npc1", type: "stand", direction: "up", time: 200 },
            { type: "textMessage", text: "Hey this is a private residence, man." },
            { who: "npc1", type: "walk", direction: "right" },
            { who: "npc1", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "down" },

          ]
        }
      ],
      [utils.asGridCoord(12,20)]: [
        {
          events: [

            { type: "changeMap", 
              map: "House0",
              x: utils.withGrid(-6),
              y: utils.withGrid(2),
              direction: "up", 
            }
          ]
        }
      ]
    } 
  },
  House0: {
    id: "House0",
    lowerSrc: "/images/maps/House0.png",
    upperSrc: "",
    configObjects: {
      hero: {
        type: "Hero",
        isPlayerControlled: true,
        x: utils.withGrid(-1),
        y: utils.withGrid(2),

      },
      npc1: {
        type: "Person",
        x: utils.withGrid(-2),
        y: utils.withGrid(1),
        src: "/images/characters/people/npc1.png",
        talking: [
          {
            events: [
              {type: "textMessage", text: "Are ya winning son?", faceHero: "npc1"},
              {who: "npc1", type: "stand", direction: "down"}
            ]
          }
        ],
        behaviorLoop: [
          {type: "stand", direction: "down", time: 1500},
          {type: "stand", direction: "right", time: 4500},
          {type: "stand", direction: "down", time:3000},
          {type: "stand", direction: "right", time:1200},
        ]
      },
    },
    cutsceneSpaces: {

      [utils.asGridCoord(-6,3)]: [
        {
          events: [

            { type: "changeMap", 
            map: "Starville",
            x: utils.withGrid(12),
            y: utils.withGrid(21),
            direction: "down",              
             }

          ]
        }
      ]
    }
      // npc2: new GameObject({
      //   x: 10,
      //   y: 8,
      //   src: "/images/characters/people/npc1.png"
      // })
    }
  }
