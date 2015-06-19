(function() {

  return {
      defaultState: 'loading',
      requests: {
            getSuspendedTickets: function(query){
                return {
                    url: "/api/v2/suspended_tickets.json",
                    type: "GET",
                    dataType: "json"
                };
            },
            getSuspendedTicketsByPage: function(x){
                return {
                    url: "/api/v2/suspended_tickets.json?page=" + x,
                    type: "GET",
                    dataType: "json"
                };
            },
			recoverSuspendedTicket: function(id){
				return {
					url: "/api/v2/suspended_tickets/" + id + "/recover.json",
					type: "PUT",
					dataType: "json"
				};
			}
      },
    events: {
      'app.activated':'doSomething',
	  'click button.submit': 'submitForm',
      'click i.icon-refresh': 'refreshall'
    },
    refreshall: function(){
        this.getSuspendedTickets();
    },
	submitForm: function(){
		//find out which causes are selected.
        var recover = [];
		this.$('input[type="checkbox"]:checked').each(function(){
            recover.push(this.value);
        });
        this.recoverSuspendedTickets(recover);
        //create another function that picks up the  suspended tickets a new. also push the list of causes that are to be recovered.
		//loop through all suspended tickets and see if the suspended tickets has a cause that matches one of the selected causes.
	   
    },
    recoverSuspendedTickets: function(causes){
        this.switchTo('loading');
        this.ajax('getSuspendedTickets')
            .done(function(data) {
                if (data.count === 0){this.switchTo('suspendtypes');return;} //TODO: Add layout for nothing found
				var size = Math.ceil(data.count/100);
                var results = (size == 1) ? new Array(0) : new Array(size-2);
				results.push(data.suspended_tickets);
				for (var i = 1; i < size; i++){
				    /*jshint loopfunc: true */
				    this.ajax('getSuspendedTicketsByPage', i+1)
				        .done(function(restdata){
				            results.push(restdata.suspended_tickets);
                            if (!restdata.next_page){
                                var ids = [];
                                for (var a = 0; a < results.length; a++){
                                    for (var b = 0; b < results[a].length; b++){
                                        if (_.contains(causes, results[a][b].cause)){
                                            ids.push(results[a][b].id);
                                        }
                                        //get id's that match the causes.
                                    }
                                }
                                var here = this;
                                _.each(ids, function(id){here.ajax('recoverSuspendedTicket', id);});
                                this.switchTo('suspendtypes');
                            }
                        });
				}
                //TODO: add functionality to recover tickets for the cause of suspension
            });
    },
    getSuspendedTickets: function(){
        this.switchTo('loading');
        this.ajax('getSuspendedTickets')
            .done(function(data) {
                if (data.count === 0){this.switchTo('suspendtypes');return;} //TODO: Add layout for nothing found
				var size = Math.ceil(data.count/100);
                var results = (size == 1) ? new Array(0) : new Array(size-2);
				results.push(data.suspended_tickets);
				for (var i = 1; i < size; i++){
				    /*jshint loopfunc: true */
				    this.ajax('getSuspendedTicketsByPage', i+1)
				        .done(function(restdata){
				            results.push(restdata.suspended_tickets);
                            if (!restdata.next_page){
                                var causes = [];
                                for (var a = 0; a < results.length; a++){
                                    for (var b = 0; b < results[a].length; b++){
                                        causes.push(results[a][b].cause);
                                    }
                                }
                                causes = _.uniq(causes);
                                this.switchTo('suspendtypes', {
                                    causes: causes,
                                    total: data.count
                                });
                            }
				        });
				}
                //TODO: add functionality to recover tickets for the cause of suspension
            });
    },
    doSomething: function() {
        //get suspended tickets.
        this.getSuspendedTickets();
    }
  };

}());