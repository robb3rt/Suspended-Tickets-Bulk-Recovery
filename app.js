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
			},
			recoverMany: function(ids){
				return {
					url: "/api/v2/suspended_tickets/recover_many.json?ids=" + ids,
					type: "PUT",
					dataType: "json"
				}
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
					storage.push.apply(storage, data.suspended_tickets);
					if (url == "/api/v2/suspended_tickets.json"){
						if (data.count === 0){
							this.switchTo('suspendtypes', {
								causes: causes,
								total: data.count
							});
							return;
						}
					} else {
						storage.push.apply(storage, results);
					}
					url = data.next_page;
					if (!url){
						var ids = [];
						_.each(storage, function(i){
							if (_.contains(causes, i.cause)){
								ids.push(i.id);
							}
						});
						//TODO Add some timeout
						var here = this;
						_.each(ids, function(id){here.ajax('recoverSuspendedTicket', id);});
						this.paginateTickets("/api/v2/suspended_tickets.json", "");
						return
						
						/**** Updatemany should only be used
						**** when the cause of suspension is not "received from support address" *****
						this.ajax('recoverMany', ids).done(function(data) {
							this.paginateTickets("/api/v2/suspended_tickets.json", "");
							return;
						});*/
					};
					this.recoverSuspendedTickets(causes, url, storage);
				});
		},
		paginateTickets: function(url, results){
			this.ajax('getTickets', url)
				.done(function(data) {
					var storage = new Array(0);
					storage.push.apply(storage, data.suspended_tickets);
					if (url == "/api/v2/suspended_tickets.json"){
						if (data.count === 0){
							this.switchTo('suspendtypes', {
								causes: causes,
								total: data.count
							});
							return;
						}
					} else {
						storage.push.apply(storage, results);
					}
					url = data.next_page;
					if (!url){
						var causes = [];
						_.each(storage, function(i){
							causes.push(i.cause); //TODO for every cause - make a list of ticket id's
						});
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
		doSomething: function() {
			//get suspended tickets.
			this.paginateTickets("/api/v2/suspended_tickets.json", "");
		}
	};
}());