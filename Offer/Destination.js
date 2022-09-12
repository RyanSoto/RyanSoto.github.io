class Destination extends GameObject{
    constructor(config) {
        super(config);
        this.sprite = new Sprite({
            gameObject: this,
            src: "images/Objects/foodreceptacle.png",
            animations: {
                "Empty" :  [ [0,0] ],
                "Full" :   [ [1,0] ],
            },
            currentAnimation: "Full"
        });
        this.storyFlag = config.storyFlag;

        this.talking = [
            {
                required: ["ORDER_TAKEN", this.storyFlag ],
                events: [
                    { type: "textMessage", text: "You leave the delivery in the receptacle" },
                    { type: "removeStoryFlag", flag: this.storyFlag },
                    { type: "removeStoryFlag", flag: "ORDER_TAKEN" },
                    { type: "removeStoryFlag", flag: "CONFIRMED_PICKUP" },
                    { type: "finishDelivery"}
                ]
            },
            {
            required: ["CONFIRMED_PICKUP"],
            events: [
            { type: "textMessage", text:  "They are not expecting an order."},

            ]   
        },
            {
                // required: [this.storyFlag],
                events: [
                { type: "textMessage", text: "You don't have an order to deliver." },

                ]   
            },

        ]

    }

    update() {
        this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag = "ORDER_TAKEN"]
            ? "Empty"
            : "Full";
       }
}