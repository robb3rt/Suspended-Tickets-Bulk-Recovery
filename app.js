(function() {

  return {
      defaultState: 'loading',
      requests: {
			getTickets: function(url){
				return {
					url: url,
					type: "GET",
					dataType: "json"
				}
			},
            getSuspendedTickets: function(){
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
		this.switchTo('loading');
        this.paginateTickets("/api/v2/suspended_tickets.json", "");
    },
	submitForm: function(){
		//find out which causes are selected.
        var recover = [];
		this.$('input[type="checkbox"]:checked').each(function(){
            recover.push(this.value);
        });
        this.recoverSuspendedTickets(recover, "/api/v2/suspended_tickets.json", "");
        //create another function that picks up the  suspended tickets a new. also push the list of causes that are to be recovered.
		//loop through all suspended tickets and see if the suspended tickets has a cause that matches one of the selected causes.
	   
    },
    recoverSuspendedTickets: function(causes, url, results){
        this.ajax('getTickets', url)
            .done(function(data) {
				var storage = new Array(0);
				storage.push(data.suspended_tickets);
				if (url == "/api/v2/suspended_tickets.json"){
					if (data.count === 0){
						this.switchTo('suspendtypes', {
                            causes: causes,
                            total: data.count
                        });
						return;
					}
				} else {
					storage = storage.concat(results);
				}
				url = data.next_page;
				if (!url){
					var ids = [];
					storage.reverse();
					for (var a = 0; a < storage.length; a++){
                        for (var b = 0; b < storage[a].length; b++){
                            if (_.contains(causes, storage[a][b].cause)){
                                ids.push(storage[a][b].id);
                            }
                        }
                    }
					var here = this;
                    _.each(ids, function(id){here.ajax('recoverSuspendedTicket', id);});
                    this.paginateTickets("/api/v2/suspended_tickets.json", "");
					return
				};
				this.recoverSuspendedTickets(causes, url, storage);
			});
    },
	/*
    recoverSuspendedTickets: function(causes){
        this.switchTo('loading');
        this.ajax('getSuspendedTickets')
            .done(function(data) {
                if (data.count === 0){this.switchTo('suspendtypes');return;} //TODO: Add layout for nothing found
				var size = Math.ceil(data.count/100);
                var results = (size == 1) ? new Array(0) : new Array(size-2);
				results.push(data.suspended_tickets);
				for (var i = 1; i < size; i++){
				    /*jshint loopfunc: true 
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
                                this.paginateTickets();
                            }
                        });
				}
                //TODO: add functionality to recover tickets for the cause of suspension
            });
    },*/
	
	paginateTickets: function(url, results){
		this.ajax('getTickets', url)
            .done(function(data) {
				var storage = new Array(0);
				storage.push(data.suspended_tickets);
				if (url == "/api/v2/suspended_tickets.json"){
					if (data.count === 0){
						this.switchTo('suspendtypes', {
                            causes: causes,
                            total: data.count
                        });
						return;
					}
				} else {
					storage = storage.concat(results);
				}
				url = data.next_page;
				if (!url){
					var causes = [];
					storage.reverse();
					for (var a = 0; a < storage.length; a++){
                        for (var b = 0; b < storage[a].length; b++){
                            causes.push(storage[a][b].cause);
                        }
                    }
                    causes = _.uniq(causes);
                    this.switchTo('suspendtypes', {
						causes: causes,
                        total: data.count
                    });
					return
				};
				this.paginateTickets(url, storage);
			});
	},
	
	/*
    getSuspendedTickets: function(){
        this.switchTo('loading');
        this.ajax('getSuspendedTickets')
            .done(function(data) {
                if (data.count === 0){this.switchTo('suspendtypes');return;} //TODO: Add layout for nothing found
				var size = Math.ceil(data.count/100);
                var results = (size == 1) ? new Array(0) : new Array(size-2);
				results.push(data.suspended_tickets);
				for (var i = 1; i < size; i++){
				    /*jshint loopfunc: true 
				    this.ajax('getSuspendedTicketsByPage', i+1)
				        .done(function(restdata){
				            results.push(restdata.suspended_tickets);
                            if (!restdata.next_page){
                                var causes = [];
								console.dir(results);
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
    },*/
    doSomething: function() {
        //get suspended tickets.
		this.paginateTickets("/api/v2/suspended_tickets.json", "");
    }
  };

}());