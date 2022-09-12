class Hero extends GameObject {
  constructor(config) {
    super(config);
    this.movingProgressRemaining = 0;
    this.isStanding = false;
    this.intentPosition = null; // [x,y]
    this.speed = 4
    this.isBiking = true;
    this.isPlayerControlled = config.isPlayerControlled || false;
    this.directionUpdate = {
      "up": ["y", -this.speed],
      "down": ["y", this.speed],
      "left": ["x", -this.speed],
      "right": ["x", this.speed],
    }
    this.standBehaviorTimeout;



  }



  update(state) {
    if (this.movingProgressRemaining > 0) {
      this.updatePosition();
    } else {
      //Case: We're keyboard ready and have an arrow pressed
      if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
        this.startBehavior(state, {
          type: "walk",
          direction: state.arrow
        })
      }
      this.updateSprite(state);
      
    }
  }

  startBehavior(state, behavior) {
    // this.isBiking = true;
    this.toggleBikeOn()
    this.toggleBikeOff()
    if (!this.isMounted) {
      return;
    }

    //Set character direction to whatever behavior has
    this.direction = behavior.direction;


    if (behavior.type === "walk") {
      //Stop here if space is not free
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {

        
          behavior.retry && setTimeout(() => {
            this.startBehavior(state, behavior)
          }, 10);
          return;
        
      }

      //Ready to walk or bike!
  
      if (this.isBiking === true) {
        this.movingProgressRemaining = 4;
      } else {
      this.movingProgressRemaining = 16;}

      //Add next position intent
      const intentPosition = utils.nextPosition(this.x,this.y, this.direction)
      this.intentPosition = [
        intentPosition.x,
        intentPosition.y,
      ]

      this.updateSprite(state);
    }

    if (behavior.type === "stand") {
      this.isStanding = true;
      
      if (this.standBehaviorTimeout) {
        clearTimeout(this.standBehaviorTimeout);
        console.log("xlear")
      }
      this.standBehaviorTimeout = setTimeout(() => {
        utils.emitEvent("PersonStandComplete", {
          whoId: this.id
        })
        this.isStanding = false;
      }, behavior.time)
    }

  }

  updatePosition() {
      const [property, change] = this.directionUpdate[this.direction];
      this[property] += change;
      this.movingProgressRemaining -= 1;

      if (this.movingProgressRemaining === 0) {
        //We finished the walk!
        this.intentPosition = null;
        utils.emitEvent("PersonWalkingComplete", {
          whoId: this.id
        })
      }
  }

  toggleBikeOn() { 
    new KeyPressListener("KeyB", () => {
      if (this.movingProgressRemaining === 0) {
        console.log("Bike On")
        // console.trace(this.toggleBikeOff)
        this.isBiking = true;
        this.speed = 4;
        this.directionUpdate = {
          "up": ["y", -this.speed],
          "down": ["y", this.speed],
          "left": ["x", -this.speed],
          "right": ["x", this.speed],
        }}
      })
  } 


  toggleBikeOff() { 
    new KeyPressListener("KeyN", () => {
      if (this.movingProgressRemaining === 0) {
      // console.log("Bike Off")
      // console.trace(this.toggleBikeOff)
      this.isBiking = false;
      this.speed = 1;
      this.directionUpdate = {
        "up": ["y", -this.speed],
        "down": ["y", this.speed],
        "left": ["x", -this.speed],
        "right": ["x", this.speed],
      }}
    })
  }

  updateSprite() {

    if (this.movingProgressRemaining > 0 && this.isBiking === true) {
    this.sprite.setAnimation("bike-"+this.direction);
    return;
    } else if (this.isBiking == true) {
       this.sprite.setAnimation("bidle-"+this.direction); 
    }   
   if (this.movingProgressRemaining > 0 && (this.isBiking === false)) {
      this.sprite.setAnimation("walk-"+this.direction);
      return;
    }
    else if (this.isBiking === false) {
      this.sprite.setAnimation("idle-"+this.direction);   
      return;
    } 
  }
}