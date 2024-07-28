const BaseNode = require('./BaseNode');

class StorageNode extends BaseNode {
  constructor(name, input=null, resourceType) {
    super(name, [input], [], 0);
    this.resourceType = resourceType;

    // Add stock for the only resource type of the storage
    this.stock[resourceType] = [];
  }

  addOutput(channel) {
    throw new Error('StorageNode cannot have output channels.');
  }

  addOutputs(channels) {
    throw new Error('StorageNode cannot have output channels.');
  }

  addInput(channel) {
    if (this.inputs.length >= 1) {
      throw new Error('StorageNode cannot have more than one input channel.');
    }
    super.addInput(channel);
  }

  addInputs(channels) {
    if (this.inputs.length + channels.length > 1) {
      throw new Error('StorageNode cannot have more than one input channel.');
    }
    super.addInputs(channels);
  }

  // Method to get the current storage
  getStorage() {
    return this.stock;
  }
}

module.exports = StorageNode;
