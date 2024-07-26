const Node = require('./Node');

class StorageNode extends Node {
  constructor(name, inputs = []) {
    super(name, inputs, [], 0);
    this.storage = []; // Array to store collected resources
  }

  addOutput(channel) {
    throw new Error('StorageNode cannot have output channels.');
  }

  addOutputs(channels) {
    throw new Error('StorageNode cannot have output channels.');
  }

  // Method to collect resources from input channels
  collectResources() {
    for (const channel of this.inputs) {
      while (channel.queue.length > 0) {
        const resource = channel.take();
        this.storage.push(resource);
        console.log(`Collected ${resource.name} from ${channel.id}`);
      }
    }
  }

  // Method to get the current storage
  getStorage() {
    return this.storage;
  }
}

module.exports = StorageNode;
