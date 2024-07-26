class Resource{
    constructor(id='undefined', type='undefined', unit='undefined'){
        this.id = id;
        this.type = type;
        this.unit = unit;
        this.timestamp = Date.now;
    }
}

exports.Resource = Resource;