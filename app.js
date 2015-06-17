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
            getSuspendedTicketsByPage: function(query, x){
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
    },
	submitForm: function(){
		//find out which causes are selected.
		
		//loop through all suspended tickets and see if the suspended tickets has a cause that matches one of the selected causes.
	},
    doSomething: function() {
        //get suspended tickets.
        this.ajax('getSuspendedTickets')
            .done(function(data) {
                if (data.count === 0){this.switchTo('suspendtypes');return;} //TODO: Add layout for nothing found
				var size = Math.ceil(data.count/100);
				var results = new Array(size-1);
				results.push(data.suspended_tickets);
                var causes = [];
				for (var i = 1; i < size; i++){
				    /*jshint loopfunc: true */
				    this.ajax('getSuspendedTicketsByPage', i+1)
				        .done(function(restdata){
				            results.push(restdata.suspended_tickets);
				        });
				}
                for (var a = 0; a < results.length; a++){
                    for (var b = 0; b < results[a].length; b++){
                        causes.push(results[a][b].cause);
                    }
                }
                causes = _.uniq(causes);
                console.dir(causes);
                this.switchTo('suspendtypes', {
							causes: causes,
							total: data.count
				});
                //TODO: add functionality to recover tickets for the cause of suspension
            });
    }
  };

}());