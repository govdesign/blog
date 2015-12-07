(function() {
    'use strict';

    var disqusPublicKey = "ynDPsjH5Buso4kx1dOQZ4rXkrCIiKJJoRGsRqvZXlHuTO1xmnUwVMX5hTtox61U7";
    var disqusShortname = "govdesign";
    function DisqusCounter(api_key, short_name) {
        this.key = api_key;
        this.forum = short_name;
        this.items = {};

        this.collect_posts = function() {
            var els = document.getElementsByClassName('disqus_counter');
            var idents = [];

            var get_ident = function(el) {
                for(var idx=0; idx < el.attributes.length; idx++) {
                    var attr = el.attributes[idx];
                    if(attr.name == 'data-disqus-identifier') {
                        return attr;
                    }
                }
                return null;
            };

            for(var idx=0; idx < els.length; idx++) {
                var el = els[idx];
                var ident = get_ident(el);
                if(!ident) continue;
                this.items[ident.value] = el;
                idents.push(ident.value);
            };
            return idents;
        }

        this.get_url = function() {
            var url = 'https://disqus.com/api/3.0/threads/set.jsonp?'
                + '&forum=' + disqusShortname
                + '&callback=__DISQUS_JSON'
                + '&api_key=' + disqusPublicKey;
            url = url + '&' + this.collect_posts().map(function(item) {return 'thread=ident:' + item}).join('&')
            return url;
        };

        this.load = function() {
            var body = document.getElementsByTagName('body')[0];
            var script_jsonp = document.createElement('script');
            script_jsonp.src = this.get_url();
            body.appendChild(script_jsonp);
        };
        this.drawCommentsCountText = function(ident, count) {
            if(!this.items[ident] || count == 0) {
                return;
            }
            var el = this.items[ident];
            el.innerText = count + ' ' + this.getCommentsCountText(count);
        }

        this.getCommentsCountText = function(count) {
            if(count == 0) {
                return 'нет комментариев';
            }
            count = count % 100;

            if (count == 1) {
                return 'комментарий';
            }
            else if (count >= 2 && count < 5) {
                return 'комментария';        
            }
            return 'комментариев';
        }

        this.jsonp = function(obj) {
            if(!obj || !obj.response) {
                console.log('wrong response object');
                return;
            }

            for(var idx in obj.response) {
                var item = obj.response[idx];
                for(var key in item.identifiers) {
                    var ident = item.identifiers[key];
                    if(this.items[ident]) {
                        this.drawCommentsCountText(ident, item.posts)
                        break; 
                    }
                }
            }
        };

        window.__DISQUS_JSON = this.jsonp.bind(this);
    }

    var counter = (new DisqusCounter(disqusPublicKey, disqusShortname));
    counter.load();
})();
