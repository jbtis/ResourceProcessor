const BaseNode = require('./BaseNode');
const { Resource } = require('./Resource');

class ProductionNode extends BaseNode {
  constructor(name, inputs = [], output, recipe = {}, executionTimeS = 1) {
    super(name, inputs, [output], executionTimeS);
    this.recipe = recipe;
    this.productionCounter = 0;
  }

  // Method to check if all required resources are available
  areResourcesAvailable() {
    for (let [resourceName, quantity] of Object.entries(this.recipe)) {
      let totalAvailable = this.inputs.reduce((total, channel) => {
        return total + channel.queue.filter(resource => resource.name === resourceName).length;
      }, 0);
      if (totalAvailable < quantity) {
        return false;
      }
    }
    return true;
  }

  // Method to consume resources from the input channels
  consumeResources() {
    for (let [resourceName, quantity] of Object.entries(this.recipe)) {
      for (let channel of this.inputs) {
        while (quantity > 0 && channel.queue.length > 0) {
          let resource = channel.queue.find(resource => resource.name === resourceName);
          if (resource) {
            channel.queue.splice(channel.queue.indexOf(resource), 1);
            quantity--;
          }
        }
      }
    }
  }

  async produce() {
    this.isProducing = true;
    console.log(`${this.name} has started production!`);

    while (this.isProducing) {
      if (this.areResourcesAvailable()) {
        this.consumeResources();
        await this.sleep(this.executionTimeS * 1000);
        this.productionCounter += 1;
        //const id = this.name + '.' + this.res
        const resource = new Resource('test');
        console.log(`${this.name} produced ${resource.name}`);
        this.outputs[0].put(resource);
      } else {
        console.log('Tried to produce but not enough resources.');
      }
      await this.sleep(TIME_BETWEEN_QUERIES_MS);
    }
  }

  stop() {
    this.isProducing = false;
    console.log(`${this.name} has stopped production.`);
  }
}

module.exports = ProductionNode;
