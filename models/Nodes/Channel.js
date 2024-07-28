const GeneratorNode = require('./GeneratorNode');
const ProductionNode = require('./ProductionNode');
const StorageNode = require('./StorageNode');

class Channel {
  constructor(outputNode, inputNode, speedS = 0, bandwidth = 1000) {
    this.outputNode = outputNode;
    this.inputNode = inputNode;
    this.id = outputNode.name + '->' + inputNode.name;
    this.speedS = speedS;
    this.bandwidth = bandwidth;
    this.queue = [];
    this.active = false; // Flag to check if the channel is active
    this.resourceType = this.outputNode.resourceType;

    // Validate the channel creation
    if (!this.validateChannel()) {
      throw new Error('Invalid channel configuration');
    }
  }

  validateChannel() {
    // Check that the output node is a generator or a production node
    if (!(this.outputNode instanceof GeneratorNode || this.outputNode instanceof ProductionNode)) {
      console.log(`${this.outputNode.name} must be a GeneratorNode or a ProductionNode.`);
      return false;
    }
  
    // Check that the input node is a production node or a storage node
    if (!(this.inputNode instanceof ProductionNode || this.inputNode instanceof StorageNode)) {
      console.log(`${this.inputNode.name} must be a ProductionNode or a StorageNode.`);
      return false;
    }
  
    const outputResourceType = this.outputNode.resourceType;
  
    if (this.inputNode instanceof ProductionNode) {
      // Check if the production node's recipe contains the resource type and that there is no channel already connected for that resource type
      if (!this.inputNode.recipe[outputResourceType]) {
        console.log(`${this.inputNode.name} does not require resource type ${outputResourceType}.`);
        return false;
      }
  
      const existingChannel = this.inputNode.inputs.find(input => input.outputNode.resourceType === outputResourceType);
      if (existingChannel) {
        console.log(`A channel for resource type ${outputResourceType} is already connected to ${this.inputNode.name}.`);
        return false;
      }
    }
  
    if (this.inputNode instanceof StorageNode) {
      // Check if the storage node has no existing input channel and the resource type matches
      if (this.inputNode.inputs.length > 0) {
        console.log(`${this.inputNode.name} already has an input channel.`);
        return false;
      }
  
      if (this.inputNode.resourceType !== outputResourceType) {
        console.log(`${this.inputNode.name}'s resource type ${this.inputNode.resourceType} does not match ${this.outputNode.name}'s resource type ${outputResourceType}.`);
        return false;
      }
    }
  
    console.log(`Channel created: ${this.outputNode.name}.${this.outputNode.resourceType} -> ${this.inputNode.name}`);
    return true;
  }
  
  

  // Activate the channel
  activate() {
    this.active = true;
    this.flow();
  }

  // Deactivate the channel
  deactivate() {
    this.active = false;
  }

  // Load resource to the channel
  load() {
    if (this.queue.length < this.bandwidth) {
      let resource = this.outputNode.takeResource(this.resourceType);
      if (resource) {
        this.queue.push(resource);
        console.log(`${resource.type} added to the channel ${this.id} [${this.queue.length}]`);
      }
    } else {
      console.log('Bandwidth limit reached!');
    }
  }

  // Resource has traveled through the channel. Unload
  unload() {
    if (this.queue.length > 0) {
      let resource = this.queue.shift();
      this.inputNode.addResource(resource);
      console.log(`${resource.type} unloaded to ${this.inputNode.name} [${this.inputNode.stock[this.resourceType].length}]`);
    } else {
      console.log('No resources to take');
      return null;
    }
  }

  // Asynchronous function to handle resource flow through the channel
  async flow() {
    while (this.active) {
      this.load();
      if (this.queue.length > 0) {
        // Simulate the travel time through the channel
        if (this.speedS > 0) {
          await new Promise(resolve => setTimeout(resolve, this.speedS * 1000)); // Convert to milliseconds
        }
        this.unload();
      } else {
        // Wait for a short period before checking the queue again
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
}

module.exports = Channel;
