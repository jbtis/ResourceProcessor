class Channel{
    constructor(id='undefined', speedMs = 0, bandwidth = 1000){
        this.id = id;
        this.speedMs = speedMs;
        this.bandwidth = bandwidth;
        this.queue = [];

        // TODO: Add stockpile if bandwidth limit is reached
    }

    put(resource){
        if (this.queue.length < this.bandwidth){

            // TODO: Add Speed
            this.queue.push(resource);
            console.log('Resource %{resource.name} added to the channel %{this.id}');
        } else {
            console.log('Bandwidth limit reached!');
        }
    }

    take(){
        if (this.queue.length > 0 ){
            return this.queue.shift();
        } else {
            console.log('No resources to take');
            return null;  
        }
    }
}

exports.Channel = Channel;