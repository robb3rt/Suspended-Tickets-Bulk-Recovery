(function() {

	return {
		defaultState: 'loading',
		
		requests: {
			getTickets: function(url){
				return {
					url: url,
					type: "GET",
					dataType: "json"
				};
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
				};
			}
		},
		events: {
			'app.activated':'doSomething',
			'click button.submit': 'submitForm',
			'click i.icon-refresh': 'refreshall',
            'mousedown .unselected label': 'mouseDownRegister',
            'mousedown .selected label': 'mouseDownRegister',
			'mouseup .unselected .suspended.info': 'selectCause',
			'mouseup .selected .suspended.info': 'unselectCause',
			'mouseup .unselected label': 'selectCause',
			'mouseup .selected label': 'unselectCause',
			'mouseup .unselected .time.parsed': 'selectCause',
			'mouseup .selected .time.parsed': 'unselectCause',
			'mouseup .unfold.expand': 'expandCause',
			'mouseup .unfold.minimize': 'minimizeCause',
            'mouseleave .clickedthis': 'deleteRegister',
			'change .underlings input[type=checkbox]':'selectItems',
			'change .head input[type=checkbox]': 'selectHeads'
		},
        mouseDownRegister: function(evt){
            evt.preventDefault();
            evt.currentTarget.className = evt.currentTarget.classList.contains("clickedthis") ? evt.currentTarget.className : evt.currentTarget.className + " clickedthis";
            if (evt.shiftKey){ //check if you're pressing shift
                if (this.$(".lastselect").length > 0) {
                    var checkboxes = new Array(evt.currentTarget.parentNode.parentNode.getElementsByTagName('input').length);
                    _.each(evt.currentTarget.parentNode.parentNode.getElementsByTagName('input'), function(a, i){
                        checkboxes.splice(0, 1);
                        if (a.type == "checkbox"){
                            checkboxes.push(a);
                        }
                    });
                    console.dir(checkboxes);
                    var start = checkboxes.indexOf(evt.currentTarget.childNodes[0]);
                    var end = checkboxes.indexOf(this.$(".lastselect")[0].childNodes[0]);
                    var here = this;
                    _.each(checkboxes.slice(Math.min(start,end), Math.max(start,end) + 1), function(a){
                        a.parentNode.className = a.parentNode.classList.contains("checking") ? a.parentNode.className : a.parentNode.className + " checking";
                        if (here.$(".lastselect")[0].childNodes[0].checked){
                            a.checked = true;
                            here.markCause(a.parentNode.parentNode);
                        } else {
                            a.checked = false;
                            here.unmarkCause(a.parentNode.parentNode);
                        }
                    });
                }
            }
            if (this.$(".lastselect").length > 0) {
                _.each(this.$(".lastselect"), function(i){
                    i.classList.remove("lastselect");
                });
            }
            evt.currentTarget.className = evt.currentTarget.classList.contains("lastselect") ? evt.currentTarget.className : evt.currentTarget.className + " lastselect";
        },
        deleteRegister: function(evt){
            _.each(this.$(".clickedthis"), function(i){
                i.classList.remove("clickedthis");
            });
        },
        deleteChecking: function(){
            _.each(this.$(".checking"), function(i){
                i.classList.remove("checking");
            });
        },
		selectItems: function(evt){
            if (!evt.currentTarget.parentNode.classList.contains("clickedthis") || evt.currentTarget.parentNode.classList.contains("checking")){
                
                evt.currentTarget.checked = evt.currentTarget.checked ? false : true;
                return;
            }
            this.deleteRegister(evt);
			//look for max amount of input fields
			if (evt.currentTarget.checked){
				evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].innerHTML = parseInt(evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].innerHTML, 10) + 1;
			} else {
				evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].innerHTML = parseInt(evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].innerHTML, 10) - 1;
			}
			if (evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].innerHTML === "0"){
				//remove used class, since nothing is selected
				evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].classList.remove("used");
			} else {
				//add class saying this is used
				var here = this;
				var length = 0;
				_.each(evt.currentTarget.parentNode.parentNode.parentNode.getElementsByTagName('input'), function(i){
					if (i.type == "checkbox"){
						length += 1;
					}
				});
				if (evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].innerHTML == length){
					//add class marking that all items have been selected                   
                        evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[3].childNodes[0].checked = true;
					this.markCause(evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1]);
				} else {
					//add class marking that some items have been selected.
                    evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].className = evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].classList.contains("used") ? evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].className : evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].className + " used";
                evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[3].childNodes[0].checked = false;
					this.unmarkCause(evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1]);
				}
			}
            this.deleteChecking();
			//check if selecting or deselecting
			this.updateSelected();
		},
		selectHeads: function(evt){
            if (!evt.currentTarget.parentNode.classList.contains("clickedthis")){
                evt.currentTarget.checked = evt.currentTarget.checked ? false : true;
                return;
            }
            this.deleteRegister(evt);
			var here = this;
			var length = 0;
			_.each(evt.currentTarget.parentNode.parentNode.parentNode.childNodes[3].getElementsByTagName('input'), function(i){
				if (i.type == "checkbox"){
					length += 1;
				}
				if (i.type == "checkbox" && evt.currentTarget.parentNode.parentNode.classList.contains("selected")){
					i.checked = true;
					here.markCause(i.parentNode.parentNode);
				} else {
					i.checked = false;
					here.unmarkCause(i.parentNode.parentNode);
				}
			});
            var selected = evt.currentTarget.parentNode.parentNode.classList.contains("selected");
            if (selected){
                evt.currentTarget.parentNode.parentNode.className = evt.currentTarget.parentNode.parentNode.classList.contains("used") ? evt.currentTarget.parentNode.parentNode.className : evt.currentTarget.parentNode.parentNode.className + " used" ;
            } else {
               evt.currentTarget.parentNode.parentNode.classList.remove("used"); 
            }
			evt.currentTarget.parentNode.parentNode.childNodes[1].innerHTML = selected ? length : 0;
			here.updateSelected();
		},
		updateSelected: function(){
			this.$('#selected')[0].innerHTML = this.$('.underlings input[type=checkbox]:checked').length;
		},
		expandCause: function(evt){
			evt.currentTarget.parentNode.parentNode.childNodes[3].style.display = "inline";
			evt.currentTarget.parentNode.className = evt.currentTarget.parentNode.className + " first";
			evt.currentTarget.innerHTML = "-";
			evt.currentTarget.classList.remove("expand");
			evt.currentTarget.className = evt.currentTarget.className + " minimize";
		},
		minimizeCause: function(evt){
			evt.currentTarget.parentNode.parentNode.childNodes[3].style.display = "none";
			evt.currentTarget.parentNode.classList.remove("first");
			evt.currentTarget.innerHTML = "+";
			evt.currentTarget.classList.remove("minimize");
			evt.currentTarget.className = evt.currentTarget.className + " expand";
		},
		selectCause: function(evt){
            if(evt.currentTarget.classList.contains("clickedthis")){
                this.markCause(evt.currentTarget.parentNode);
            } else if (evt.currentTarget.classList.contains("suspended") && evt.currentTarget.parentNode.classList.contains("clickedthis")){
				this.markCause(evt.currentTarget.parentNode.parentNode);
			}
		},
		unselectCause: function(evt){
            if(evt.currentTarget.classList.contains("clickedthis")){
                this.unmarkCause(evt.currentTarget.parentNode);
            } else if (evt.currentTarget.classList.contains("suspended") && evt.currentTarget.parentNode.classList.contains("clickedthis")){
				this.unmarkCause(evt.currentTarget.parentNode.parentNode);
			}
		},
		markCause: function(e){
			e.classList.remove("unselected");
			e.className = e.classList.contains("selected") ? e.className : e.className + " selected";
		},
		unmarkCause: function(e){
			e.classList.remove("selected");
			e.className = e.classList.contains("unselected") ? e.className : e.className + " unselected";
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
			//loop through all suspended tickets and see if the suspended tickets has a cause that matches one of the selected causes 
		},
        formatDates: function(data) {
            return new Date(data).toLocaleString();
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
						return;
						//TODO:
						//see if possible to turn off triggers that send email notifications.
						
						/**** Updatemany should only be used
						**** when the cause of suspension is not "received from support address" *****
						this.ajax('recoverMany', ids).done(function(data) {
							this.paginateTickets("/api/v2/suspended_tickets.json", "");
							return;
						});*/
					}
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
                        var index = 0;
						var causes = [];
                        var storagelength = storage[0].length;
						_.each(storage, function(i){
							causes.push(i.cause); //TODO for every cause - make a list of ticket id's
						});
						causes = _.uniq(causes);
                        var container = new Array(causes.length);
                        var here = this;
                        _.each(causes, function(i){
                            var tickets = new Array(storage.length); //sender - subject - time - timestamp - to - id?
                            var indexed = [];
                            _.each(storage, function(t){
                                tickets.splice(0,1);
                                if (t.cause == i){
                                    tickets.push({id: t.id, subject: t.subject, received: here.formatDates(t.created_at), created_at: t.created_at, from: t.author.email, to: t.recipient});
                                    indexed.push(index);
                                }
                                index += 1;
                            });
                            tickets.sort(function(a, b){
                                var keyA = new Date(a.created_at),
                                keyB = new Date(b.created_at);
                                // Compare the 2 dates
                                if(keyA < keyB) return -1;
                                if(keyA > keyB) return 1;
                                return 0;
                            });
                            container.splice(0,1);
                            container.push({cause: i, suspended: tickets});
                            indexed.sort(function(a, b){return b-a;});
                            _.each(indexed, function(i){
                                storage.splice(i,1);
                            });
                        });
                        this.switchTo('suspendtypes', {
							causes: container,
							total: data.count
						});
						return;
					}
					this.paginateTickets(url, storage);
				});
		},
		doSomething: function() {
			//get suspended tickets.
			this.paginateTickets("/api/v2/suspended_tickets.json", "");
		}
	};
}());