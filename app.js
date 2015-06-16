(function() {

  return {
      
      requests: {
            getSuspendedTickets: function(query){
                return {
                    url: "/api/v2/suspended_tickets.json",
                    type: "GET",
                    dataType: "json"
                };
            },
            getSuspendedTicketsByPage: function(query, x){
                return {
                    url: "/api/v2/suspended_tickets.json?page=" + x,
                    type: "GET",
                    dataType: "json"
                };
            },
      }
    events: {
      'app.activated':'doSomething'
    },

    doSomething: function() {
        //get suspended tickets.
        this.switchTo('loading');
        this.ajax('getSearchResults', query)
            .done(function(data) {
                if (data.count === 0){this.switchTo('searchbar');return;}
				var size = Math.ceil(data.count/100);
				var results = (size == 1) ? new Array(0) : new Array(size-2);
				results.push(data.results);
				for (var i = 1; i < size; i++){
				    /*jshint loopfunc: true */
				    this.ajax('getSearchResultsByPage', query, i+1)
				        .done(function(restdata){
				            results.push(restdata.results);
				        });
				}
            });
        this.switchTo('suspendtypes');
    }
  };

}());