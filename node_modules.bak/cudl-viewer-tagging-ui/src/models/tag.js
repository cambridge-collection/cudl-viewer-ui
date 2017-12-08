
export default class Tag {
    constructor(options) {

        // TODO validate values

        if (options.hasOwnProperty('tags')) {
            //
            // tag resource is in json format
            //
            var tag = options.tag;

            this.name  = tag.name;
            this.raw   = tag.raw;
            this.value = tag.value;
        } else {
            //
            // tag resource is from cloud
            //
            this.docId = options.docId;

            this.name  = options.name;
            this.raw   = options.raw || 0;
            this.value = options.value || 0.0;
        }
    }

    getDocumentId() {
        return this.docId;
    }

    getName() {
        return this.name;
    }

    getRaw() {
        return this.raw;
    }

    getValue() {
        return this.value;
    }

}
