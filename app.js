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
            'mousedown .added.empty': 'emptyFilter',
            'mousedown .filter.unused': 'createFilter',
            'mousedown .filter.used': 'createFilter',
            'mousedown .filter.used .original': 'createFilter',
			'mouseleave .empty': 'createdFilter',
            'mouseup': 'leaveFilter',
			'mouseup .unselected .suspended.info': 'selectCause',
			'mouseup .selected .suspended.info': 'unselectCause',
			'mouseup .unselected label': 'selectCause',
			'mouseup .selected label': 'unselectCause',
			'mouseup .unselected .time.parsed': 'selectCause',
			'mouseup .selected .time.parsed': 'unselectCause',
			'mouseup .unfold.expand': 'expandCause',
			'mouseup .unfold.minimize': 'minimizeCause',
            'mouseleave .clickedthis': 'deleteRegister',
			'mouseleave .checking': 'deleteChecking',
			'change .underlings input[type=checkbox]':'selectItems',
			'change .head input[type=checkbox]': 'selectHeads'
		},
        createdFilter: function(evt){
			evt.currentTarget.parentNode.classList.remove("emptying");
        },
        emptyFilter: function(evt){
            evt.preventDefault();
            evt.currentTarget.parentNode.className = evt.currentTarget.parentNode.classList.contains("emptying") ? evt.currentTarget.parentNode.className : evt.currentTarget.parentNode.className + " emptying";
            _.each(evt.currentTarget.parentNode.getElementsByTagName('input'), function(i){
                i.value = "";
            });
			evt.currentTarget.parentNode.classList.remove("used");
			evt.currentTarget.parentNode.className = evt.currentTarget.parentNode.classList.contains("unused") ? evt.currentTarget.parentNode.className : evt.currentTarget.parentNode.className + " unused";
            if(evt.currentTarget.parentNode.classList.contains("subject")){
                _.each(this.$(".subjectfilter"),function(i){
                    i.classList.remove("subjectfilter");
                    if (!i.classList.contains("emailfilter") && !i.classList.contains("datefilter") && !i.classList.contains("result")){
                        i.className = i.className + " result";
                    }
                    
                });
            }
            if(evt.currentTarget.parentNode.classList.contains("date")){
                _.each(this.$(".datefilter"),function(i){
                    i.classList.remove("datefilter");
                    if (!i.classList.contains("emailfilter") && !i.classList.contains("subjectfilter") && !i.classList.contains("result")){
                        i.className = i.className + " result";
                    }
                });
            }
            if(evt.currentTarget.parentNode.classList.contains("email")){
                _.each(this.$(".emailfilter"),function(i){
                    i.classList.remove("emailfilter");
                    if (!i.classList.contains("subjectfilter") && !i.classList.contains("datefilter") && !i.classList.contains("result")){
                        i.className = i.className + " result";
                    }
                });
            }
			_.each(this.$(".middle.last"), function(i){
					i.classList.remove("last");
            });
			_.each(this.$(".underlings"), function(i){
				if(this.$(i).children(":visible:last").length > 0){
					i.parentNode.childNodes[1].className = i.parentNode.childNodes[1].classList.contains("first") ? i.parentNode.childNodes[1].className : i.parentNode.childNodes[1].className + " first";
				}
                if(this.$(i).children(".result:last").length > 0){
                    i.parentNode.childNodes[1].classList.remove("noresults");
                }
			});
        },
        createFilter: function(evt){
            if(evt.currentTarget.classList.contains("emptying") || evt.currentTarget.parentNode.classList.contains("emptying")){
                return;
            }
            evt.currentTarget.className = evt.currentTarget.classList.contains("setup") ? evt.currentTarget.className : evt.currentTarget.className + " setup";
            evt.currentTarget.classList.remove("unused");
            evt.currentTarget.classList.remove("used");
            if (evt.currentTarget.classList.contains("subject") || evt.currentTarget.classList.contains("email") || evt.currentTarget.classList.contains("date")) {
                if (evt.currentTarget.childNodes.length > 1){
                    _.each(evt.currentTarget.childNodes, function(i){
                        if (i.classList.contains("added")){
                            i.style.display = "";
                        }
                    });
                    evt.currentTarget.childNodes[0].style.display = "none";
                } else {
					if (evt.currentTarget.classList.contains("subject")){
						this.SubjectFilter(evt.currentTarget);
					} else if (evt.currentTarget.classList.contains("email")) {
						this.EmailFilter(evt.currentTarget);
					} else if (evt.currentTarget.classList.contains("date")) {
						this.DateFilter(evt.currentTarget);
					}
                }
            }
        },
        SubjectFilter: function(e){
            e.innerHTML = '<span class="original">' + e.innerHTML + '</span><span class="added empty"> &#10005;</span><span class="added subject"><span class="left">' + e.innerHTML + ': </span><input class="right" type="text" name="Subject" placeholder="Filter for subject"></span>';
            e.childNodes[0].style.display = "none";
        },
		EmailFilter: function(e){
            e.innerHTML = '<span class="original">' + e.innerHTML + '</span><span class="added empty"> &#10005;</span><span class="added email"><span class="left">' + e.innerHTML + ': </span><input class="right" type="text" name="Email" placeholder="Filter email addresses"></span>';
            e.childNodes[0].style.display = "none";
        },
		DateFilter: function(e){
            e.innerHTML = '<span class="original">' + e.innerHTML + '</span><span class="added empty"> &#10005;</span><span class="added date"><span class="left">Start ' + e.innerHTML + ': </span><input class="right start_date" name="start_date"></span><span class="added date"><span class="left">End ' + e.innerHTML + ': </span><input class="right end_date" name="end_date"></span></span>';
            e.childNodes[0].style.display = "none"; 
			this.$('.start_date').datepicker({ dateFormat: "dd-mm-yy" });
            this.$('.end_date').datepicker({ dateFormat: "dd-mm-yy" });
            //this.$('.end_date').datepicker('setDate', new Date());
        },
        leaveFilter: function(evt){
            var container = this.$(".infos");
            if (!container.is(evt.target) && container.has(evt.target).length === 0){
                var used = false;
				var startdate, enddate, subject, email;
                if (!this.$(".filter.setup").length){
                    return;
                }
                _.each(this.$(".filter.setup"), function(i){
                    i.classList.remove("setup");
                    if (i.getElementsByTagName('input').length > 0){
                        _.each(i.getElementsByTagName('input'), function(a){
                            if (a.value){
                                used = true;
								startdate = startdate ? startdate : (a.parentNode.classList.contains("date") ? (a.classList.contains("start_date") ? a.value : undefined) : undefined);
								enddate = enddate ? enddate : (a.parentNode.classList.contains("date") ? (a.classList.contains("end_date") ? a.value : undefined) : undefined);
								subject = subject ? subject : (a.parentNode.classList.contains("subject") ? a.value : "");
								email = email ? email : (a.parentNode.classList.contains("email") ? a.value : "");
                            }
                        });
                    }
                    i.className = used ? i.className + " used" : i.className + " unused";
                    if(i.classList.contains("subject") && !used){
                        _.each(this.$(".subjectfilter"),function(i){
                            i.classList.remove("subjectfilter");
                        });
                        return;
                    }
                    if(i.classList.contains("date") && !used){
                        _.each(this.$(".datefilter"),function(i){
                            i.classList.remove("datefilter");
                        });
                        return;
                    }
                    if(i.classList.contains("email") && !used){
                        _.each(this.$(".emailfiler"),function(i){
                            i.classList.remove("emailfilter");
                        });
                        return;
                    }
                    used = false;
                });
                _.each(this.$(".underlings"), function(i){
                    _.each(i.childNodes, function(a){
                        if (a.nodeName == "DIV" && !a.classList.contains("selected")){
                            _.each(a.getElementsByTagName("span"), function(b){
                                a.className = (b.classList.contains("subject") && b.classList.contains("info")) ? (subject ? ( ~b.innerHTML.toLowerCase().indexOf(subject.toLowerCase()) ? (a.classList.contains("result") ? a.className : a.className + " result") : (a.classList.contains("subjectfilter") ? a.className : a.className.replace(/(?:^|\s)result(?!\S)/, '') + " subjectfilter")) : a.className) : a.className;
                                a.className = (b.classList.contains("mail") && b.classList.contains("info")) ? (email ? ( ~b.innerHTML.toLowerCase().indexOf(email.toLowerCase()) ? (a.classList.contains("result") ? a.className : a.className + " result") : (a.classList.contains("emailfilter") ? a.className : a.className.replace(/(?:^|\s)result(?!\S)/, '') + " emailfilter")) : a.className) : a.className;
                            });
                        }
                    });
					if(this.$(i).children(".result:last").length > 0){
						last = this.$(i).children(".result:last")[0];
						last.className = last.classList.contains("last") ? last.className : last.className + " last";
					} else {
						i.parentNode.childNodes[1].classList.remove("first");
						//TODO check for results here
                        //TODO create function to check if you are filtering for each filter option.
                        if (this.$(i).children(".result").length === 0){
                            i.parentNode.childNodes[1].className = i.parentNode.childNodes[1].classList.contains("noresults") ? i.parentNode.childNodes[1].className : i.parentNode.childNodes[1].className + " noresults";
                        }
					}
				});
                _.each(this.$(".added"), function(i){
                    i.style.display = i.classList.contains("empty") ? "" : "none";
                });
                _.each(this.$(".original"), function(i){
                    i.style.display = "inline";
                });
            }
        },
        mouseDownRegister: function(evt){
            evt.preventDefault();
            evt.currentTarget.className = evt.currentTarget.classList.contains("clickedthis") ? evt.currentTarget.className : evt.currentTarget.className + " clickedthis";
            if (evt.shiftKey && !evt.currentTarget.parentNode.classList.contains("head")){ //check if you're pressing shift
                if (this.$(".lastselect").length > 0) {
                    var checkboxes = new Array(evt.currentTarget.parentNode.parentNode.getElementsByTagName('input').length);
                    _.each(evt.currentTarget.parentNode.parentNode.getElementsByTagName('input'), function(a, i){
                        checkboxes.splice(0, 1);
                        if (a.type == "checkbox"){
                            checkboxes.push(a);
                        }
                    });
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
            if (!evt.currentTarget.parentNode.classList.contains("clickedthis")){ //not clicking what you're supposed to?
                evt.currentTarget.checked = evt.currentTarget.checked ? false : true;
                return;
            }
            this.deleteRegister(evt);
			if (evt.currentTarget.parentNode.classList.contains("checking")){ //using the multi select feature?
				evt.currentTarget.checked = evt.currentTarget.parentNode.parentNode.classList.contains("selected") ? true : false;
				this.deleteChecking();
			}
			//look for max amount of input fields
			var length = 0;
			var checked = 0;
			_.each(evt.currentTarget.parentNode.parentNode.parentNode.getElementsByTagName('input'), function(i){
				if (i.type == "checkbox"){
					length += 1;
					if (i.checked){
						checked += 1;
					}
				}
			});
			evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].innerHTML = checked;
			if (evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].innerHTML === "0"){
				//remove used class, since nothing is selected
				evt.currentTarget.parentNode.parentNode.parentNode.parentNode.childNodes[1].classList.remove("used");
			} else {
				//add class saying this is used
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
			//TODO: check if filters are active. if so, rewrite this thing.
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
			if (evt.currentTarget.parentNode.classList.contains("checking") || evt.currentTarget.classList.contains("checking")){
				return;
			}
            if (evt.currentTarget.classList.contains("clickedthis")){
                this.markCause(evt.currentTarget.parentNode);
            } else if (evt.currentTarget.classList.contains("suspended") && evt.currentTarget.parentNode.classList.contains("clickedthis")){
				this.markCause(evt.currentTarget.parentNode.parentNode);
			}
		},
		unselectCause: function(evt){
			if (evt.currentTarget.parentNode.classList.contains("checking") || evt.currentTarget.classList.contains("checking")){
				return;
			}
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
							causes.push(i.cause);
						});
						causes = _.uniq(causes);
                        var container = new Array(causes.length);
                        var here = this;
                        _.each(causes, function(i){
                            var tickets = new Array(storage.length);
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