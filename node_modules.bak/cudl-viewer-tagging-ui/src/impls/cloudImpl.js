import $ from 'jquery';
import d3 from 'd3';
import cloud from 'd3-cloud';


/**
 * derived from Json Davies's wordcloud.
 * @see https://www.jasondavies.com/wordcloud/cloud.min.js
 */

export var cloudImpl = {

        fill : {},
        W : 0,
        H : 0,
        words : [],
        scale : 1,

        tags : {},
        fontSize : [],

        layout : {},
        svg : {},
        background : {},
        vis : {},

        complete : 0,
        statusText : {},
        maxZoom : 3,
        maxLen : 100, // max number of word displayed
        rwords : [], // removed keywords
        total : 0,

        // From Jonathan Feinberg's cue.language, see lib/cue.language/license.txt.
        // wordSeparators : /[\s\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g,

        setup : function(options) {
            var self = this;

            this.W = options.width || 500;
            this.H = options.height || 500;

            // status element
            this.statusText = d3.select( options.statusEl );

            // d3 cloud
            this.layout = cloud()
                .timeInterval(10)
                .size([this.W, this.H])
                .rotate(0)
                .fontSize(function(d) { return self.fontSize(+d.value); })
                .text(function(d) { return d.key; })
                .on('word', this._progress)
                .on('end', this._draw);

            // d3
            if ( !d3.select( options.cloudEl ).select('svg').empty() )
                // remove existing svg
                d3.select( options.cloudEl ).select('svg').remove();

            this.svg = d3.select( options.cloudEl )
                .append('svg')
                .attr('width', this.W)
                .attr('height', this.H);

            this.background = this.svg.append('g');

            this.vis = this.svg
                .append('g')
                .attr('transform', 'translate(' + [this.W >> 1, this.H >> 1] + ')');

            // color fill
            this.fill = d3.scale.category20b();
        },

        clear: function() {
            this.tags = {};
            this.rwords = [];
            this.svg.selectAll('text').remove();
        },

        load : function(words, rwords) {
            this._parseArray(words);
            this.rwords = rwords;
            this.total = words.length;
        },

        _progress : function() {
            cloudImpl.statusText.text(++cloudImpl.complete + '/' + cloudImpl.total);
        },

        _parseArray : function(array) {
            if (array.length > 0) {
                this.tags = {};
                var cases = {};
                for (var i = 0; i < array.length; i++) {
                    var word = array[i];
                    word.name = word.name.replace(punctuation, "");
                    cases[word.name.toLowerCase()] = word.name;
                    this.tags[word.name.toLowerCase()] = word.raw;
                }

                var ar = d3.entries(this.tags);
                this.tags = d3.shuffle(ar);

                this.tags.forEach(function(d) {
                    d.key = cases[d.key];
                });

                this.tags = this.tags.slice(0, this.maxLen);
            }

            this._generate();
        },

        _generate : function() {
            // cloudImpl.layout.font('Impact').spiral('archimedean');
            this.layout.font('Impact').spiral('archimedean');
            this.fontSize = d3.scale['log']().range([10, 100]);

            if (this.tags.length) {
                var m = this._largest(this.tags);
                var n = this._smallest(this.tags);
                this.fontSize.domain([n, m]);
            }

            this.complete = 0;
            this.statusText.style('display', null);

            this.words = [];

            // cloudImpl.layout.stop().words( this.tags ).start();
            this.layout.stop().words( this.tags ).start();
        },

        _draw : function(data, bounds) {
            cloudImpl.scale = bounds ? Math.min(
                cloudImpl.W / Math.abs(bounds[1].x - cloudImpl.W / 2),
                cloudImpl.W / Math.abs(bounds[0].x - cloudImpl.W / 2),
                cloudImpl.H / Math.abs(bounds[1].y - cloudImpl.H / 2),
                cloudImpl.H / Math.abs(bounds[0].y - cloudImpl.H / 2)) / 2 : 1;

            cloudImpl.words = data;

            var text = cloudImpl.vis.selectAll('text')
                .data(cloudImpl.words, function(d) { return d.text.toLowerCase(); });

            text.transition()
                .duration(1000)
                .attr('transform', function(d) { return 'translate(' + [d.x, d.y] + ')'; })
                .style('font-size', function(d) { return d.size + 'px'; });

            text.enter().append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', function(d) { return 'translate(' + [d.x, d.y] + ')'; })
                .style('font-size', function(d) { return d.size + 'px'; })
                .on('click', function(d) {

                    ////////////////////////////////////////////////

                    // cache.modWords = [];

                    // var effect = $(this).css('text-decoration');
                    // if (effect != 'line-through') { // strikethrough
                    //     $(this).css('text-decoration', 'line-through');
                    //     // this.setAttribute('style', this.getAttribute('style') + ' text-decoration: line-through;');

                    //     // update removed keywords
                    //     // -1 if removing the word
                    //     //
                    //     cache.addModWords(d.text, -1);
                    // } else { // revoke
                    //     $(this).css('text-decoration', 'none');

                    //     // update removed keywords
                    //     // 1 if changing mind
                    //     //
                    //     cache.addModWords(d.text, 1);
                    // }

                    // ajax.updateRemovedTags();


                    ////////////////////////////////////////////////


                })
                .style('opacity', 1e-6)
                .transition()
                .duration(1000)
                .style('opacity', 1);

            text.style('font-family', function(d) { return d.font; })
                .style('fill', function(d) { return cloudImpl.fill(d.text.toLowerCase()); })
                .text(function(d) { return d.text; });

            var exitGroup = cloudImpl.background.append('g')
                .attr('transform', cloudImpl.vis.attr('transform'));

            var exitGroupNode = exitGroup.node();

            text.exit().each(function() {
                exitGroupNode.appendChild(this);
            });

            exitGroup.transition()
                .duration(1000)
                .style('opacity', 1e-6)
                .remove();

            // zoom behavior
            cloudImpl.svg
                .call(d3.behavior.zoom()
                    .translate([cloudImpl.W>>1, cloudImpl.H>>1])
                    .scale(cloudImpl.scale)
                    .scaleExtent([cloudImpl.scale, cloudImpl.scale*3])
                    .on('zoom', cloudImpl._zoom));

            cloudImpl.vis
                .transition()
                .delay(1000)
                .duration(750)
                .attr('transform', 'translate(' + [cloudImpl.W >> 1, cloudImpl.H >> 1] + ')scale(' + cloudImpl.scale + ')')
                .call(cloudImpl._endAll, function() {

                    //
                    // mark removed keywords
                    //

                    if (cloudImpl.rwords.length > 0) {
                        cloudImpl.svg.selectAll('text').each(function(d) {
                            var text = d.text;
                            for (var j = 0; j < cloudImpl.rwords.length; j++) {
                                var rword = cloudImpl.rwords[j];
                                if (rword.name == text) {
                                    $(this).css('text-decoration', 'line-through');
                                }
                            }
                        });
                    }
                });

        },

        _zoom : function() { // this scope changes
            cloudImpl.vis.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
        },

        _largest : function(tags) {
            var tmp = 0;
            for (var i=0; i<tags.length; i++) {
                var tag = tags[i];
                if (tag.value > tmp) tmp = tag.value;
            }
            return tmp;
        },

        _smallest : function(tags) {
            var tmp = 10000;
            for (var i=0; i<tags.length; i++) {
                var tag = tags[i];
                if (tag.value < tmp) tmp = tag.value;
            }
            return tmp;
        },

        _endAll : function(transition, callback) {
            var n = 0;
            if(transition.empty()) {
                callback();
            } else {
                transition
                    .each(function() {
                        ++n;
                    }).each('end', function() {
                        if (!--n) {
                            callback.apply(this, arguments);
                        }
                    });
            }
        },

        // shuffle : function(o) {
        //     for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        //     return o;
        // },

        // isEmpty : function (obj) {
        //     for (var prop in obj) {
        //         if (obj.hasOwnProperty(prop))
        //             return false;
        //     }
        //     return true;
        // },

}

var stopWords = /^(i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/,
    wordSeparators = /[\s\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g,
    unicodePunctuationRe = "!-#%-*,-/:;?@\\[-\\]_{}\xa1\xa7\xab\xb6\xb7\xbb\xbf\u037e\u0387\u055a-\u055f\u0589\u058a\u05be\u05c0\u05c3\u05c6\u05f3\u05f4\u0609\u060a\u060c\u060d\u061b\u061e\u061f\u066a-\u066d\u06d4\u0700-\u070d\u07f7-\u07f9\u0830-\u083e\u085e\u0964\u0965\u0970\u0af0\u0df4\u0e4f\u0e5a\u0e5b\u0f04-\u0f12\u0f14\u0f3a-\u0f3d\u0f85\u0fd0-\u0fd4\u0fd9\u0fda\u104a-\u104f\u10fb\u1360-\u1368\u1400\u166d\u166e\u169b\u169c\u16eb-\u16ed\u1735\u1736\u17d4-\u17d6\u17d8-\u17da\u1800-\u180a\u1944\u1945\u1a1e\u1a1f\u1aa0-\u1aa6\u1aa8-\u1aad\u1b5a-\u1b60\u1bfc-\u1bff\u1c3b-\u1c3f\u1c7e\u1c7f\u1cc0-\u1cc7\u1cd3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205e\u207d\u207e\u208d\u208e\u2329\u232a\u2768-\u2775\u27c5\u27c6\u27e6-\u27ef\u2983-\u2998\u29d8-\u29db\u29fc\u29fd\u2cf9-\u2cfc\u2cfe\u2cff\u2d70\u2e00-\u2e2e\u2e30-\u2e3b\u3001-\u3003\u3008-\u3011\u3014-\u301f\u3030\u303d\u30a0\u30fb\ua4fe\ua4ff\ua60d-\ua60f\ua673\ua67e\ua6f2-\ua6f7\ua874-\ua877\ua8ce\ua8cf\ua8f8-\ua8fa\ua92e\ua92f\ua95f\ua9c1-\ua9cd\ua9de\ua9df\uaa5c-\uaa5f\uaade\uaadf\uaaf0\uaaf1\uabeb\ufd3e\ufd3f\ufe10-\ufe19\ufe30-\ufe52\ufe54-\ufe61\ufe63\ufe68\ufe6a\ufe6b\uff01-\uff03\uff05-\uff0a\uff0c-\uff0f\uff1a\uff1b\uff1f\uff20\uff3b-\uff3d\uff3f\uff5b\uff5d\uff5f-\uff65",
    punctuation = new RegExp("[" + unicodePunctuationRe + "]", "g");
