import moment from 'moment';


export default class Annotation {
    constructor(options) {

        // TODO validate values

        if (options.hasOwnProperty('annotation')) {
            //
            // annotation resouce is in json format,
            // received from the server
            //
            var anno = options.annotation;

            this.target = anno.target;
            this.type = anno.type;
            this.name = anno.name;
            this.raw = anno.raw;
            this.value = anno.value;
            this.position = anno.position;
            this.date = anno.date;
            this.uuid = anno.uuid;

        } else {
            //
            // annotation resource is collected from
            // user inputs
            //
            this.docId = options.docId;
            this.page = options.page;

            this.target = options.target;
            this.type   = options.type;
            this.name = options.name;
            this.raw = options.raw;
            this.value = options.value;
            this.position = options.position;
            this.date = options.date;
            this.uuid = options.uuid;
        }
    }

    getDocumentId() {
        return this.docId;
    }

    getPageNum() {
        return this.page;
    }

    getTarget() {
        return this.target;
    }

    getType() {
        return this.type;
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

    getPosition() {
        return this.position;
    }

    getPositionType() {
        return this.position.type;
    }

    getCoordinates() {
        return this.position.coordinates;
    }

    getDate() {
        return this.date;
    }

    getParsedDate() {
        return moment(this.date, 'YYYY-MM-DD HH:mm:ss ZZ');
    }

    getUUID() {
        return this.uuid;
    }
}
