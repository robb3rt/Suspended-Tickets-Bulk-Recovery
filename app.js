(function() {

	return {
		defaultState: 'confirmation',
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
			},
            deleteMany: function(ids){
				return {
					url: "/api/v2/suspended_tickets/destroy_many.json?ids=" + ids,
					type: "DELETE",
					dataType: "json"
				};
			}
		},
		events: {
			'click button.submit.recover.manually': 'submitForm',
            'click button.submit.recover.automatically': 'submitForm',
            'click button.submit.delete': 'submitForm',
            'click #clearfilters': 'emptyAllFilters',
			'click i.icon-refresh': 'refreshall',
			'click i.icon-arrow-down': 'scrollDown',
			'click i.icon-arrow-up': 'scrollUp',
			'blur .lastselected input[type=text].right:visible:enabled': 'reFocus',
            'mousedown #confirmuse': 'manageSuspendedTickets',
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
			'mouseup .clickedthis': 'deleteRegister2',
			'change .underlings input[type=checkbox]':'selectItems',
			'change .head input[type=checkbox]': 'selectHeads',
			'mouseup .checking': 'multiSelect',
			'mouseleave .checking': 'multiSelect',
		},
		reFocus: function(evt){
			evt.currentTarget.focus();
			if (this.$(".lastselected").length > 0) {
				_.each(this.$(".lastselected"), function(i){
					i.classList.remove("lastselected");
				});
			}
		},
		scrollDown: function(evt){
			this.$("#mainsection").context.scrollTop = this.$("#mainsection").context.scrollHeight;
		},
		scrollUp: function(evt){
			this.$("#mainsection").context.scrollTop = 0;
		},
        createdFilter: function(evt){
			evt.currentTarget.parentNode.classList.remove("emptying");
        },
        replaceFilter: function(element){
            _.each(this.$(element.parentNode.classList.contains("subject") ? ".subjectfilter" : (element.parentNode.classList.contains("date") ? ".datefilter" : ".emailfilter")), function(i){
                i.classList.remove(element.parentNode.classList.contains("subject") ? "subjectfilter" : (element.parentNode.classList.contains("date") ? "datefilter" : "emailfilter"));
                i.className = (element.parentNode.classList.contains("subject") && !i.classList.contains("emailfilter") && !i.classList.contains("datefilter") && !i.classList.contains("result")) ? i.className + " result" : (element.parentNode.classList.contains("date") && !i.classList.contains("emailfilter") && !i.classList.contains("subjectfilter") && !i.classList.contains("result") ? i.className + " result" : ( element.parentNode.classList.contains("email") && !i.classList.contains("subjectfilter") && !i.classList.contains("datefilter") && !i.classList.contains("result") ? i.className + " result" : i.className));
            });
        },
        clearFilter: function(element){
            element.parentNode.className = element.parentNode.classList.contains("emptying") ? element.parentNode.className : element.parentNode.className + " emptying";
            _.each(element.parentNode.getElementsByTagName('input'), function(i){
                i.value = "";
            });
            element.parentNode.classList.remove("used");
			element.parentNode.className = element.parentNode.classList.contains("unused") ? element.parentNode.className : element.parentNode.className + " unused";
            this.replaceFilter(element);
        },
        validateResults: function(){
            _.each(this.$(".underlings"), function(i){
				if(this.$(i).children(".result.selected").length < this.$(i).children(".result").length || i.parentNode.childNodes[1].classList.contains("noresults")){
					i.parentNode.childNodes[1].classList.remove("selected");
					i.parentNode.childNodes[1].className = i.parentNode.childNodes[1].classList.contains("unselected") ? i.parentNode.childNodes[1].className : i.parentNode.childNodes[1].className + " unselected";
					this.$(i.parentNode.childNodes[1]).find("input").checked = false;
				} else {
					i.parentNode.childNodes[1].classList.remove("unselected");
					i.parentNode.childNodes[1].className = i.parentNode.childNodes[1].classList.contains("selected") ? i.parentNode.childNodes[1].className : i.parentNode.childNodes[1].className + " selected";
					this.$(i.parentNode.childNodes[1]).find("input").checked = true;
				}
				if(this.$(i).children(":visible:last").length > 0){
					i.parentNode.childNodes[1].className = i.parentNode.childNodes[1].classList.contains("first") ? i.parentNode.childNodes[1].className : i.parentNode.childNodes[1].className + " first";
				}
                if(this.$(i).children(".result:last").length > 0){
                    i.parentNode.childNodes[1].classList.remove("noresults");
                    var last = this.$(i).children(".result:last")[0];
                    last.className = last.classList.contains("last") ? last.className : last.className + " last";
                }
			});
        },
        emptyAllFilters: function(){
            var here = this;
            _.each(this.$(".filter.used .empty"), function(e){
                here.clearFilter(e);
                e.parentNode.classList.remove("emptying");
            });
            this.validateResults();
			this.updateFiltered();
        },
        emptyFilter: function(evt){
            evt.preventDefault();
            this.clearFilter(evt.currentTarget);
            this.validateResults();
			this.updateFiltered();
        },
        createFilter: function(evt){
            if(evt.currentTarget.classList.contains("emptying") || evt.currentTarget.parentNode.classList.contains("emptying")){
                return;
            }
            evt.currentTarget.className = evt.currentTarget.classList.contains("setup") ? evt.currentTarget.className : evt.currentTarget.className + " setup";
            if (evt.currentTarget.classList.contains("subject") || evt.currentTarget.classList.contains("email") || evt.currentTarget.classList.contains("date")) {
				if (this.$(".lastselected").length > 0) {
					_.each(this.$(".lastselected"), function(i){
						i.classList.remove("lastselected");
					});
				}
				evt.currentTarget.className = evt.currentTarget.className + " lastselected";
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
				this.$(evt.currentTarget).find("input[type=text].right:visible:enabled:first").focus();
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
			this.$('.start_date').datepicker({ dateFormat: "yy-mm-dd" });
            this.$('.end_date').datepicker({ dateFormat: "yy-mm-dd" });
            //this.$('.end_date').datepicker('setDate', new Date());
        },
        leaveFilter: function(evt){
            var container = this.$(".infos");
            if (!container.is(evt.target) && container.has(evt.target).length === 0){
                var here = this;
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
								startdate = startdate ? startdate : (a.parentNode.classList.contains("date") ? (a.classList.contains("start_date") ? a.value : "") : "");
								enddate = enddate ? enddate : (a.parentNode.classList.contains("date") ? (a.classList.contains("end_date") ? a.value : "") : "");
								subject = subject ? subject : (a.parentNode.classList.contains("subject") ? a.value : "");
								email = email ? email : (a.parentNode.classList.contains("email") ? a.value : "");
                            }
                        });
                    }
                    i.className = used ? (i.classList.contains("used") ? i.className : i.className.replace( /(^|\s)unused(?!\S)/ , "") + " used") : i.className;
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
				_.each(this.$(".middle.last"), function(i){
                    i.classList.remove("last");
                });
                _.each(this.$(".underlings"), function(i){
                    _.each(i.childNodes, function(a){
                        if (a.nodeName == "DIV" && !a.classList.contains("selected")){
                            _.each(a.getElementsByTagName("span"), function(b){
                                var thisdatestring, startdatestring, enddatestring, todatestring, beginningstring;
                                //get date and compare to both start and end dates.
                                if (b.classList.contains("time")){
                                    thisdatestring = here.returnDate(b.getAttribute("timestamp"));
                                    startdatestring = startdate ? here.returnDate(startdate) : "";
                                    enddatestring = enddate ? here.returnDate(enddate) : "";
									todatestring = here.returnDate(new Date());
									beginningstring = new Date(2007);
                                }
								a.className = (b.classList.contains("time") && b.classList.contains("info")) ? (startdate || enddate ? (startdate && enddate ? (startdatestring <= thisdatestring && thisdatestring <= enddatestring ? (a.classList.contains("result") ? a.className : (a.classList.contains("subjectfilter") || a.classList.contains("emailfilter") || a.classList.contains("datefilter") ? a.className : a.className + " result")) : (a.classList.contains("datefilter") ? a.className.replace( /(^|\s)result(?!\S)/ , "") : a.className.replace( /(^|\s)result(?!\S)/ , "") + " datefilter")) : (startdate ? (startdatestring <= thisdatestring && thisdatestring <= todatestring ? (a.classList.contains("result") ? a.className : (a.classList.contains("subjectfilter") || a.classList.contains("emailfilter") || a.classList.contains("datefilter") ? a.className : a.className + " result")) : (a.classList.contains("datefilter") ? a.className.replace( /(^|\s)result(?!\S)/ , "") : a.className.replace( /(^|\s)result(?!\S)/ , "") + " datefilter")) : (beginningstring <= thisdatestring && thisdatestring <= enddatestring ? (a.classList.contains("result") ? a.className : (a.classList.contains("subjectfilter") || a.classList.contains("emailfilter") || a.classList.contains("datefilter") ? a.className : a.className + " result")) : (a.classList.contains("datefilter") ? a.className.replace( /(^|\s)result(?!\S)/ , "") : a.className.replace( /(^|\s)result(?!\S)/ , "") + " datefilter")))) : a.className) : a.className;
                                a.className = (b.classList.contains("subject") && b.classList.contains("info")) ? (subject ? ( ~b.innerHTML.toLowerCase().indexOf(subject.toLowerCase()) ? (a.classList.contains("result") ? a.className : (a.classList.contains("subjectfilter") || a.classList.contains("emailfilter") || a.classList.contains("datefilter") ? a.className : a.className + " result")) : (a.classList.contains("subjectfilter") ? a.className.replace( /(^|\s)result(?!\S)/ , "") : a.className.replace( /(^|\s)result(?!\S)/ , "") + " subjectfilter")) : a.className) : a.className;
                                a.className = (b.classList.contains("mail") && b.classList.contains("info")) ? (email ? ( ~b.innerHTML.toLowerCase().indexOf(email.toLowerCase()) ? (a.classList.contains("result") ? a.className : (a.classList.contains("subjectfilter") || a.classList.contains("emailfilter") || a.classList.contains("datefilter") ? a.className : a.className + " result")) : (a.classList.contains("emailfilter") ? a.className.replace( /(^|\s)result(?!\S)/ , "") : a.className.replace( /(^|\s)result(?!\S)/ , "") + " emailfilter")) : a.className) : a.className;
                            });
                        }
                    });
					if(this.$(i).children(".result:last").length > 0){
						var last = this.$(i).children(".result:last")[0];
						last.className = last.classList.contains("last") ? last.className : last.className + " last";
					} else {
						i.parentNode.childNodes[1].classList.remove("first");
                        if (this.$(i).children(".result").length === 0){
                            i.parentNode.childNodes[1].className = i.parentNode.childNodes[1].classList.contains("noresults") ? i.parentNode.childNodes[1].className : i.parentNode.childNodes[1].className + " noresults";
                        }
					}
                    if(this.$(i).children(".result.selected").length < this.$(i).children(".result").length || i.parentNode.childNodes[1].classList.contains("noresults")){
                        i.parentNode.childNodes[1].classList.remove("selected");
                        i.parentNode.childNodes[1].className = i.parentNode.childNodes[1].classList.contains("unselected") ? i.parentNode.childNodes[1].className : i.parentNode.childNodes[1].className + " unselected";
                        this.$(i.parentNode.childNodes[1]).find("input").checked = false;
                    } else {
                        i.parentNode.childNodes[1].classList.remove("unselected");
                        i.parentNode.childNodes[1].className = i.parentNode.childNodes[1].classList.contains("selected") ? i.parentNode.childNodes[1].className : i.parentNode.childNodes[1].className + " selected";
                        this.$(i.parentNode.childNodes[1]).find("input").checked = true;
                    }
				});
                _.each(this.$(".added"), function(i){
                    i.style.display = i.classList.contains("empty") ? "" : "none";
                });
                _.each(this.$(".original"), function(i){
                    i.style.display = "inline";
                });
				this.updateFiltered();
            }
        },
        mouseDownRegister: function(evt){
            evt.preventDefault();
			if (evt.which == 3){
				return;
			}
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
					this.updateSelected();
                }
            }
            if (this.$(".lastselect").length > 0) {
                _.each(this.$(".lastselect"), function(i){
                    i.classList.remove("lastselect");
                });
            }
            evt.currentTarget.className = evt.currentTarget.classList.contains("lastselect") ? evt.currentTarget.className : evt.currentTarget.className + " lastselect";
        },
        deleteRegister2: function(evt){
			if (evt.which == 3){
				_.each(this.$(".clickedthis"), function(i){
					i.classList.remove("clickedthis");
				});
			}
		},
		deleteRegister: function(){
            _.each(this.$(".clickedthis"), function(i){
                i.classList.remove("clickedthis");
            });
        },
        deleteChecking: function(){
            _.each(this.$(".checking"), function(i){
                i.classList.remove("checking");
            });
        },
		selectItem: function(label, origin){
			if (!label.classList.contains("clickedthis")){ //not clicking what you're supposed to?
                label.childNodes[0].checked = label.childNodes[0].checked ? false : true;
                return;
            }
			this.deleteRegister();
			//using multiselect feature?
			if (label.classList.contains("checking") && origin){
				label.childNodes[0].checked = label.childNodes[0].parentNode.parentNode.classList.contains("selected") ? true : false;
			}
			this.deleteChecking();
			if (!label.childNodes[0].checked){
				this.unmarkCause(label.parentNode);
			} else {
				this.markCause(label.parentNode);
			}
			//look for max amount of input fields
			var length = 0;
			var checked = 0;
			_.each(label.childNodes[0].parentNode.parentNode.parentNode.getElementsByTagName('input'), function(i){
				if (i.type == "checkbox" && i.parentNode.parentNode.classList.contains("result")){
					length += 1;
					if (i.checked){
						checked += 1;
					}
				}
			});
            this.$(label.childNodes[1].parentNode.parentNode.parentNode.parentNode.childNodes[1]).find(".itemcount")[0].innerHTML = checked;
			if (this.$(label.childNodes[1].parentNode.parentNode.parentNode.parentNode.childNodes[1]).find(".itemcount")[0].innerHTML === "0"){
				//remove used class, since nothing is selected
				label.childNodes[1].parentNode.parentNode.parentNode.parentNode.childNodes[1].classList.remove("used");
			} else {
				//add class saying this is used
				if (this.$(label.childNodes[1].parentNode.parentNode.parentNode.parentNode.childNodes[1]).find(".itemcount")[0].innerHTML == length){
					//add class marking that all items have been selected
                    label.childNodes[1].parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[3].childNodes[0].checked = true;
					this.markCause(label.childNodes[1].parentNode.parentNode.parentNode.parentNode.childNodes[1]);
				} else {
					//add class marking that some items have been selected.
                    label.childNodes[1].parentNode.parentNode.parentNode.parentNode.childNodes[1].className = label.childNodes[1].parentNode.parentNode.parentNode.parentNode.childNodes[1].classList.contains("used") ? label.childNodes[1].parentNode.parentNode.parentNode.parentNode.childNodes[1].className : label.childNodes[1].parentNode.parentNode.parentNode.parentNode.childNodes[1].className + " used";
					label.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[3].childNodes[0].checked = false;
					this.unmarkCause(label.childNodes[1].parentNode.parentNode.parentNode.parentNode.childNodes[1]);
				}
			}
			//check if selecting or deselecting
			this.updateSelected();
		},
		multiSelect: function(evt){
			this.selectItem(evt.currentTarget, false);
		},
		selectItems: function(evt){
			this.selectItem(evt.currentTarget.parentNode, true);
		},
		selectHeads: function(evt){
			if(evt.currentTarget.parentNode.parentNode.classList.contains("noresults")){
				evt.currentTarget.parentNode.parentNode.classList.remove("selected");
				evt.currentTarget.parentNode.parentNode.classList.remove("unselected");
				evt.currentTarget.parentNode.parentNode.className = evt.currentTarget.parentNode.parentNode.className + " unselected";
				evt.currentTarget.checked = false;
				return;
			}
            if (!evt.currentTarget.parentNode.classList.contains("clickedthis")){
                evt.currentTarget.checked = evt.currentTarget.checked ? false : true;
                return;
            }
            this.deleteRegister();
			if (!evt.currentTarget.checked){
				this.unmarkCause(evt.currentTarget.parentNode.parentNode);
			} else {
				this.markCause(evt.currentTarget.parentNode.parentNode);
			}
			var here = this;
			var length = 0;
			_.each(evt.currentTarget.parentNode.parentNode.parentNode.childNodes[3].getElementsByTagName('input'), function(i){
				if (i.parentNode.parentNode.classList.contains("result")){
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
				}
			});
            var selected = evt.currentTarget.parentNode.parentNode.classList.contains("selected");
            if (selected){
                evt.currentTarget.parentNode.parentNode.className = evt.currentTarget.parentNode.parentNode.classList.contains("used") ? evt.currentTarget.parentNode.parentNode.className : evt.currentTarget.parentNode.parentNode.className + " used" ;
            } else {
               evt.currentTarget.parentNode.parentNode.classList.remove("used"); 
            }
            //TODO
            this.$(evt.currentTarget.parentNode.parentNode).find(".itemcount")[0].innerHTML = selected ? length : 0;
			here.updateSelected();
		},
		updateSelected: function(){
			this.$('#selected')[0].innerHTML = this.$('.underlings input[type=checkbox]:checked').length;
		},
		updateFiltered: function(){
			this.$('#filtered')[0].innerHTML = this.$('.result').length;
			if(this.$('.filter.used').length > 0) {
				this.$("#clearfilters")[0].style.display = "inline-block";
			} else {
				this.$("#clearfilters")[0].style.display = "none";
			}
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
		rightClick: function(e){
			console.dir(e);
		},
		selectCause: function(evt){
			if (evt.which == 3){
				this.rightClick(evt.currentTarget);
			}
		},
		unselectCause: function(evt){
			if (evt.which == 3){
				this.rightClick(evt.currentTarget);
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
		submitForm: function(evt){
			//find out which causes are selected.
			var recover = [];
            var here = this;
			var ms = (this.setting("API calls per minute") < 200  && this.setting("API calls per minute") > 0) ? (60/this.setting("API calls per minute"))*1000 : 1200;
			var offset = 0;
			this.$('.result input[type="checkbox"]:checked').each(function(){
				recover.push(this.value);
			});
			console.dir(this.setting("API calls per minute"));
            if (evt.currentTarget.classList.contains("manually") && evt.currentTarget.classList.contains("recover")){
                _.each(recover, function(id, index) {
					setTimeout(function () {
						console.dir(index);
						here.ajax('recoverSuspendedTicket', id);
					}, ms + offset);
					offset += ms;
				});
				here.paginateTickets("/api/v2/suspended_tickets.json", "");
				return;
            } else if (evt.currentTarget.classList.contains("automatically") && evt.currentTarget.classList.contains("recover") || evt.currentTarget.classList.contains("delete")){
				var many = new Array(0);
                //get recover array and distribute it in arrays of 100 items each.
                var i,j,temparray,chunk = 100;
                for (i=0,j=recover.length; i<j; i+=chunk) {
					many.push(recover.slice(i,i+chunk));
                }
				_.each(many, function(ids, index) {
					setTimeout(function () {
						console.dir(index);
						if (evt.currentTarget.classList.contains("automatically") && evt.currentTarget.classList.contains("recover")){
							here.ajax('recoverMany', ids).done(function(data) {
								here.paginateTickets("/api/v2/suspended_tickets.json", "");
								return;
							});
						} else {
							here.ajax('deleteMany', ids).done(function(data) {
								here.paginateTickets("/api/v2/suspended_tickets.json", "");
								return;
							});
						}
					}, ms + offset);
					offset += ms;
				});
            }
		},
        formatDates: function(data) {
            return new Date(data);
        },
        returnDate: function(date) {
            var newdate = new Date(date);
            var day = newdate.getDate();
            var month = newdate.getMonth();
            var year = newdate.getFullYear();
            return new Date(year, month, day);
            
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
                                    tickets.push({id: t.id, subject: t.subject, received: moment(here.formatDates(t.created_at)).calendar(), created_at: t.created_at, from: t.author.email, to: t.recipient});
                                    indexed.push(index);
                                }
                                index += 1;
                            });
                            tickets.sort(function(a, b){
                                var keyA = new Date(a.created_at),
                                keyB = new Date(b.created_at);
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
						this.updateFiltered();
						return;
					}
					this.paginateTickets(url, storage);
				});
		},
        manageSuspendedTickets: function(){
            this.switchTo('loading');
            this.paginateTickets("/api/v2/suspended_tickets.json", "");
        },
	};
}());