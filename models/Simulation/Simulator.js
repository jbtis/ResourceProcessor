const GeneratorNode = require('../Nodes/GeneratorNode');
const ProductionNode = require('../Nodes/ProductionNode');
const StorageNode = require('../Nodes/StorageNode');
const Channel = require('../Nodes/Channel');
const Resource = require('../Nodes/Resource');
const readline = require('readline');

class Simulator {
  constructor() {
    this.GeneratorNodes = [];
    this.ProductionNodes = [];
    this.StorageNodes = [];
    this.Channels = [];
    this.productionRunning = false; // Boolean flag to track production state

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'Enter command: ',
    });

    this.rl.on('line', (input) => this.handleInput(input));

    console.log('Welcome to Resource Processor');
    this.rl.prompt();
  }

  handleInput(command) {
    if (typeof command !== 'string' || command === '') {
      console.log('Invalid command');
    } else if (command.startsWith('gen ')) {
      this.checkGeneratorCommand(command);
    } else if (command.startsWith('prod ')) {
      this.checkProductionCommand(command);
    } else if (command.startsWith('stor ')) {
      this.checkStorageCommand(command);
    } else if (command.startsWith('connect ')) {
      this.checkConnectCommand(command);
    } else if (command.startsWith('start ')) {
      this.checkStartCommand(command);
    } else if (command.startsWith('stop ')) {
      this.checkStopCommand(command);
    } else if (command === 'ls') {
      this.listNodes();
    } else if (command.startsWith('del ')) {
      this.deleteNode(command);
    } else {
      console.log('Invalid command');
    }
  
    this.rl.prompt();
  }
  

  nodeExists(name) {
    return this.GeneratorNodes.some(node => node.name === name) ||
           this.ProductionNodes.some(node => node.name === name) ||
           this.StorageNodes.some(node => node.name === name);
  }

  channelExists(id) {
    return this.Channels.some(channel => channel.id === id);
  }
  
  validateNodeName(name) {
    const valid = /^[a-zA-Z0-9_]+$/.test(name);
    if (!valid) {
      console.log(`Invalid node name ${name}. Node names must be alphanumeric and can contain underscores but no spaces.`);
    }
    return valid;
  }

  checkGeneratorCommand(command) {
    const parts = command.split(' ');
    if (parts.length === 4) {
      const [_, name, resourceType, executionTimeMs] = parts;
      const executionTime = parseInt(executionTimeMs, 10);

      if (isNaN(executionTime)) {
        console.log('Invalid execution time');
        return;
      }

      if (!this.validateNodeName(name)) {
        return;
      }

      if (this.nodeExists(name)) {
        console.log(`Node with name ${name} already exists.`);
        return;
      }

      const generator = new GeneratorNode(name, null, resourceType, executionTime);
      this.GeneratorNodes.push(generator);
      console.log(`GeneratorNode ${name} producing ${resourceType} every ${executionTimeMs}s created.`);
    } else {
      console.log('Invalid command format');
    }
  }

  checkProductionCommand(command) {
    const parts = command.split(' ');
    if (parts.length >= 4) {
      const [_, name, resourceType, ...recipeAndRateParts] = parts;
      
      // Find the rate (the last part)
      const rate = parseInt(recipeAndRateParts.pop(), 10);
      if (isNaN(rate)) {
        console.log('Invalid rate format');
        return;
      }
  
      // Parse the recipe
      const recipe = {};
      for (const item of recipeAndRateParts) {
        const [resourceName, resourceQuantity] = item.split(':');
        const quantity = parseInt(resourceQuantity, 10);
  
        if (!resourceName || isNaN(quantity)) {
          console.log('Invalid recipe format');
          return;
        }
  
        recipe[resourceName] = quantity;
      }

      if (!this.validateNodeName(name)) {
        return;
      }
  
      if (this.nodeExists(name)) {
        console.log(`Node with name ${name} already exists.`);
        return;
      }
  
      const productionNode = new ProductionNode(name, [], null, resourceType, recipe, rate);
      this.ProductionNodes.push(productionNode);
      console.log(`ProductionNode ${name} created with resource type ${resourceType}, recipe ${JSON.stringify(recipe)}, and rate ${rate}s.`);
    } else {
      console.log('Invalid command format');
    }
  }
  

  checkStorageCommand(command) {
    const parts = command.split(' ');
    if (parts.length === 3) {
      const [_, name, resourceType] = parts;

      if (!this.validateNodeName(name)) {
        return;
      }
  
      if (this.nodeExists(name)) {
        console.log(`Node with name ${name} already exists.`);
        return;
      }
  
      const storageNode = new StorageNode(name, [], resourceType);
      this.StorageNodes.push(storageNode);
      console.log(`StorageNode ${name} created to store ${resourceType}.`);
    } else {
      console.log('Invalid command format');
    }
  }

  checkConnectCommand(command) {
    const parts = command.split(' ');
    const toIndex = parts.indexOf('to');
    if (toIndex === -1 || parts.length !== 4) {
      console.log('Invalid command format. Use: connect <node> to <node>');
      return;
    }

    const outputNodeName = parts[1];
    const inputNodeName = parts[3];
  
    if (this.nodeExists(outputNodeName) && this.nodeExists(inputNodeName)) {
      // Retrieve the output node
      const outputNode = this.GeneratorNodes.find(node => node.name === outputNodeName) ||
                         this.ProductionNodes.find(node => node.name === outputNodeName);
  
      // Retrieve the input node
      const inputNode = this.ProductionNodes.find(node => node.name === inputNodeName) ||
                        this.StorageNodes.find(node => node.name === inputNodeName);
  
      if (outputNode && inputNode) {
        try {
          const channel = new Channel(outputNode, inputNode);
          this.connect(outputNode, inputNode);
          console.log(`Connected ${outputNodeName} to ${inputNodeName}`);
        } catch (error) {
          console.log(`Failed to connect ${outputNodeName} to ${inputNodeName}: ${error.message}`);
        }
      } else {
        console.log('At least one of the target nodes does not exist.');
      }
    } else {
      console.log('At least one of the target nodes does not exist.');
    }
  }
  

  checkStartCommand(command) {
    const parts = command.split(' ');
    if (parts.length === 2) {
      const [_, target] = parts;
  
      if (target === 'nodes' || target === 'channels' || target === 'all') {
        if (target === 'nodes') {
          this.startNodes();
        } else if (target === 'channels') {
          this.startChannels();
        } else if (target === 'all') {
          this.startNodes();
          this.startChannels();
        }
      } else if (this.nodeExists(target)) {
        this.startNodeByName(target);
      } else if (this.channelExists(target)) {
        this.startChannelById(target);
      } else {
        console.log('Invalid start target. Use "nodes", "channels", "all", a valid node name, or a valid channel ID.');
      }
    } else {
      console.log('Invalid command format');
    }
  }
  

  checkStopCommand(command) {
    const parts = command.split(' ');
    if (parts.length === 2) {
      const [_, target] = parts;
  
      if (target === 'nodes' || target === 'channels' || target === 'all') {
        if (target === 'nodes') {
          this.stopNodes();
        } else if (target === 'channels') {
          this.stopChannels();
        } else if (target === 'all') {
          this.stopNodes();
          this.stopChannels();
        }
      } else if (this.nodeExists(target)) {
        this.stopNodeByName(target);
      } else if (this.channelExists(target)) {
        this.stopChannelById(target);
      } else {
        console.log('Invalid stop target. Use "nodes", "channels", "all", a valid node name, or a valid channel ID.');
      }
    } else {
      console.log('Invalid command format');
    }
  }
  
  startNodes() {
    console.log('Starting production for all nodes.');
    this.GeneratorNodes.forEach(generator => generator.produce());
    this.ProductionNodes.forEach(productionNode => productionNode.produce());
    this.productionRunning = true;
  }

  stopNodes() {
    console.log('Stopping production for all nodes.');
    this.GeneratorNodes.forEach(generator => generator.stop());
    this.ProductionNodes.forEach(productionNode => productionNode.stop());
    this.productionRunning = false;
  }

  startChannels() {
    console.log('Starting all channels.');
    this.Channels.forEach(channel => channel.activate());
  }

  stopChannels() {
    console.log('Stopping all channels.');
    this.Channels.forEach(channel => channel.deactivate());
  }

  startNodeByName(name) {
    const node = this.GeneratorNodes.find(node => node.name === name) ||
                 this.ProductionNodes.find(node => node.name === name) ||
                 this.StorageNodes.find(node => node.name === name);
  
    if (node) {
      if (node instanceof StorageNode) {
        console.log(`Node ${name} can't produce.`);
      } else if (node.produce) {
        node.produce();
        console.log(`Started ${name}`);
      } else {
        console.log(`Node ${name} can't produce.`);
      }
    } else {
      console.log(`Node ${name} not found.`);
    }
  }
  
  stopNodeByName(name) {
    const node = this.GeneratorNodes.find(node => node.name === name) ||
                 this.ProductionNodes.find(node => node.name === name) ||
                 this.StorageNodes.find(node => node.name === name);

    if (node) {
      node.stop ? node.stop() : node.deactivate();
      console.log(`Stopped ${name}`);
    } else {
      console.log(`Node ${name} not found.`);
    }
  }

  startChannelById(id) {
    const channel = this.Channels.find(channel => channel.id === id);
  
    if (channel) {
      channel.activate();
      console.log(`Started channel ${id}`);
    } else {
      console.log(`Channel ${id} not found.`);
    }
  }

  stopChannelById(id) {
    const channel = this.Channels.find(channel => channel.id === id);
  
    if (channel) {
      channel.deactivate();
      console.log(`Stopped channel ${id}`);
    } else {
      console.log(`Channel ${id} not found.`);
    }
  }
  

  listNodes() {
    console.log('\n=========== Current System ===========');
    const noneString = ' - None'
    
    console.log('Generator Nodes:');
    if (this.GeneratorNodes.length === 0) {
      console.log(noneString);
    } else {
      this.GeneratorNodes.forEach(node => {
        console.log(`- ${node.name}.${node.resourceType}  @${node.executionTimeS}s [${node.stock[node.resourceType].length}]`);
      });
    }
    
    console.log('Production Nodes:');
    if (this.ProductionNodes.length === 0) {
      console.log(noneString);
    } else {
      this.ProductionNodes.forEach(node => {
        console.log(`- ${node.name}.${node.resourceType} ${JSON.stringify(node.recipe)} @${node.executionTimeS}s [${node.stock[node.resourceType].length}]`);
      });
    }
    
    console.log('Storage Nodes:');
    if (this.StorageNodes.length === 0) {
      console.log(noneString);
    } else {
      this.StorageNodes.forEach(node => {
        console.log(`- ${node.name}.${node.resourceType} [${node.stock[node.resourceType].length}]`);
      });
    }
    
    console.log('Channels:');
    if (this.Channels.length === 0) {
      console.log(noneString);
    } else {
      this.Channels.forEach(channel => {
        console.log(`- ${channel.id} @${channel.speedS}s [${channel.queue.length}]`);
      });
    }
    
    console.log('=========== End Current System ===========\n');
  }
  
  deleteNode(command) {
    const parts = command.split(' ');
    if (parts.length === 2) {
      const [_, name] = parts;

      const generatorIndex = this.GeneratorNodes.findIndex(node => node.name === name);
      if (generatorIndex !== -1) {
        this.GeneratorNodes.splice(generatorIndex, 1);
        console.log(`Deleted GeneratorNode ${name}.`);
        return;
      }

      const productionIndex = this.ProductionNodes.findIndex(node => node.name === name);
      if (productionIndex !== -1) {
        this.ProductionNodes.splice(productionIndex, 1);
        console.log(`Deleted ProductionNode ${name}.`);
        return;
      }

      const storageIndex = this.StorageNodes.findIndex(node => node.name === name);
      if (storageIndex !== -1) {
        this.StorageNodes.splice(storageIndex, 1);
        console.log(`Deleted StorageNode ${name}.`);
        return;
      }

      console.log(`Node with name ${name} does not exist.`);
    } else {
      console.log('Invalid command format');
    }
  }

  // Checks to see if connection is valid and then connects the output of node1 to the input of node2 by creating a new channel
  connect(outputNode, inputNode) {
    if (
      (outputNode instanceof GeneratorNode || outputNode instanceof ProductionNode) &&
      (inputNode instanceof ProductionNode || inputNode instanceof StorageNode)
    ) {
      // Create channel
      let channelName = outputNode.name + '->' + inputNode.name;
      let channel = new Channel(outputNode, inputNode, 1, 1000);
      outputNode.addOutput(channel);
      inputNode.addInput(channel);
      this.Channels.push(channel);
      console.log('Connected nodes!');
    } else {
      console.log(
        'Invalid Channel Creation. First node must be GeneratorNode or ProductionNode. Second node must be ProductionNode or StorageNode'
      );
    }
  }
}

module.exports = Simulator;
