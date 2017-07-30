


define( [	"jquery",
			"underscore",			
			"qlik",
			"angular", 
			"qvangular",
			"./initialproperties",
			"./lib/js/extensionUtils",
			"./lib/d3/d3",
			"./lib/css/uibootstrap",
			"text!./lib/css/buildingPath.css",
			"text!./template.html",
			'text!./dialog-template.ng.html',
			
			
		],
	function ($, _, qlik, angular, qvangular, initProps, extensionUtils, d3, uibootstrap, cssContent, template, dialogTemplate ) {
        "use strict";
		
		//create Library Object to contain all path information
				var testLib = {
					qField:"START",
					qSelected:"NoValue",
					mark:"Starting point",
					children:[]
				};
		
		var pathList = [];	//used to build select box, including path name
		
		extensionUtils.addStyleToHeader( cssContent );

		return {
			template: template,
			initialProperties: initProps,
			support: {
				snapshot: true,
				export: true,
				exportData: false
			},
			paint: function () {
				
				return qlik.Promise.resolve();
				
			},
			controller: ['$scope', 'luiDialog', function ( $scope, luiDialog) {
				//add your rendering code here
				var app = qlik.currApp(this);
				qlik.setOnError( function ( error ) {
					console.log(error);
				});
                
				
				
				$scope.library = testLib;
						
				
				
				//console.log("selection",JSON.stringify($scope.layout.qSelectionObject.qSelections));
				
				//get current selections   array
				$scope.currentSelection = $scope.layout.qSelectionObject.qSelections;
                console.log($scope.currentSelection);
				
				$scope.html = "To Visualie Discovery Paths";
				$scope.pathList = pathList;

				
				//clear all selections in current App
				$scope.clearPath = function(){
					app.clearAll();
					//console.log(JSON.stringify(library));
					
					/* $scope.testUse.push(m++);
					console.log($scope.testUse); */
					
				};
				
				
				
				//click "save" to open dialog to let user input pathname
				var pathInfo = $scope.currentSelection;
				$scope.openDialog = function() {
					luiDialog.show({
						template: dialogTemplate,
						controller: ['$scope', function( $scope ) {
							$scope.pathObj = {};
							
							
						   //console.log($scope.pathObj.pathName);
							//Save path to library
							$scope.savePath = function(){
								//pathList.push($scope.pathObj.pathName);
								pathList.push($scope.pathObj);
								//information about one path
								var path = {
									name: $scope.pathObj.pathName,
									description: $scope.pathObj.pathNote,
								};
								path.detail = [];
								var temp = path.detail;
								//format data
								angular.forEach(pathInfo, function(value, key){
									//console.log(temp);
									
									//split selected values
									value.qSelected = value.qSelected.split(", ");
									
									value.mark = path.name;
									value.children = [];
									//console.log(JSON.stringify(value));
									temp.push(value);
									temp = temp[0].children;
								});
								
								//create bookmark for this path state
								app.bookmark.create(path.name, path.description);
								
							
								//console.log(JSON.stringify(path));
							    testLib.children.push(path.detail[0]);
								//console.log(JSON.stringify(testLib));
								console.log(pathList);
								
							};
							
							
						}]
					});
					$scope.library = testLib;
					//console.log($scope.library);
					//$scope.pathList = pathList; 
				};
				
				
				
				// var orderOfPath = pathList.indexOf($scope.selectedPath);
				// //console.log(orderOfPath);
				
				//execute only when orderOfPath >-1
				$scope.get = {order: null};
				
				$scope.rebuild = function(){
					//console.log($scope.get.order);
					var temp = pathList[$scope.get.order];
					//console.log(temp.pathName);
					app.clearAll();
					
					
					app.getList("BookmarkList", function(reply){
						//console.log(reply);
						reply.qBookmarkList.qItems.forEach(function(bookmark){
							//Looking for the bookmark whose name is the same as the selected path
							if(bookmark.qData.title == temp.pathName){
								
								app.bookmark.apply(bookmark.qInfo.qId);
							};
						});
					});
					
				};
				
				
				//have prolem!!!!!!!!!!!!
				//$scope.note = temp.pathNote;
				/* $scope.catch = {selectedItem:null}; */
				
				$scope.initialScreen = true;
				$scope.pathShow = false;
 				
				$scope.start = function(){
					app.clearAll();
					$scope.initialScreen = true;
					$scope.pathShow = false;
					$scope.get.order = undefined;
					$scope.catch.value = undefined;
					count = -1;
					//console.log("done");
					//console.log($scope.library);
				}; 
				
				//count how many time the "next" is clicked, if use select box, the count will change by the select value as well
				var count = -1;
				
				
				
				$scope.catch = {value:null};
				$scope.play = function(){
					$scope.initialScreen = false;
					$scope.pathShow = true;
					//console.log($scope.catch.value);
					var num = $scope.catch.value;
					app.getList("BookmarkList", function(reply){
						//apply the bookmark for first path when switch to tab3
						var currentPath = reply.qBookmarkList.qItems[num];
						app.bookmark.apply(currentPath.qInfo.qId);
						$scope.note = currentPath.qData.description;
						$scope.name = currentPath.qData.title;
					});
					count = num;
				};
				
				
				$scope.next = function(){
					if(count < pathList.length - 1){
						$scope.initialScreen = false;
						$scope.pathShow = true;
						count++;
						$scope.catch.value = count;
						app.getList("BookmarkList", function(reply){
							//apply the bookmark for first path when switch to tab3
							var currentPath = reply.qBookmarkList.qItems[count];
							app.bookmark.apply(currentPath.qInfo.qId);
							$scope.note = currentPath.qData.description;
							$scope.name = currentPath.qData.title;
						});
					};	
				};
				
				$scope.last = function(){
					if(count > 0){
						count--;
						$scope.catch.value = count;
						
						app.getList("BookmarkList", function(reply){
							//apply the bookmark for first path when switch to tab3
							var currentPath = reply.qBookmarkList.qItems[count];
							app.bookmark.apply(currentPath.qInfo.qId);
							$scope.name = currentPath.qData.title;
							$scope.note = currentPath.qData.description;
						});
					};
				};
				
				//if count > index of pathList, disable "next"
				//if count < 1, disable "last"
				/* $scope.testUse =[10];
				var m = 0; */
				//var m = 0;

				

				
				
				
				
				
             
									
 				qvangular.directive("pathLibrary", function(){
						return {
							restrit:'EA',
							scope:true,
							link: function(scope,element, attrs){
								   
									attrs.$observe('chartData', function(newValue){
										var finalNote = angular.fromJson(attrs.noteData);
										//console.log(finalNote);
										
										var finalValue = angular.fromJson(newValue);
										//console.log(finalValue);
										
										
										//if((finalValue.children != 'undefined')&&(finalValue.children !=null)){	
											//libData.children.push(scope.library.children[0]); 
											
											
											//console.log(JSON.stringify(libData));
											
										   var svg = d3.select(element[0]);
											svg.selectAll("*").remove();
											
											
										 	
											/* var aside = svg.append("div")
											.attr("class", "treeAside")
											.style("z-index", "20")
											.style("visibility", "hidden")
											.style("height","20px"); */ 


											//building tree
											// size of the diagram   
											var viewerWidth = window.innerWidth;
											var viewerHeight = window.innerHeight;

											// Create a svg canvas
											var vis = svg.append("svg")
											.attr("id","tree-svg")
											.attr("width", viewerWidth)
											.attr("height", viewerHeight)
											.append("svg:g")
											.attr("transform", "translate(130, 50)") // shift everything to the right
											.call(d3.behavior.zoom().on("zoom", function () {
												vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
											  }));


											// Add tooltip div
											var div = svg.append("div")
											.attr("class", "treeTooltip")
											.style("opacity", 1e-6);

											// Create a tree "canvas"
											var tree = d3.layout.tree()
											.size([viewerHeight-200,viewerWidth]);

											var diagonal = d3.svg.diagonal()
												.projection(function(d) {
														return [d.y, d.x];
													});

												

											// Preparing the data for the tree layout, convert data into an array of nodes
											var nodes = tree.nodes(finalValue);

											// Create an array with all the links
											var links = tree.links(nodes);

											var link = vis.selectAll("pathlink")
											.data(links)
											.enter().append("svg:path")
											.attr("class", "link")
											.attr("d", diagonal)
											.style("fill", "none")
											.style("stroke", "#ccc")
											.style("stroke-width", 1.5);

											var node = vis.selectAll("g.node")
											.data(nodes)
											.enter().append("svg:g")
											.attr("class","gNode")
											.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
											.on("mouseover", function(d){mouseover(d);})
											.on("mousemove", function(d){mousemove(d);})
											.on("mouseout", function(d){mouseout(d);});


											
			 
											// Add the dot at every node
											node.append("svg:rect")
											.attr("rx", 7)
											.attr("ry", 7)
											.attr("width",function(d) {
												return d.qField.length * 6 +15;
											})   
											.attr("height",20)
											.attr("class","libraryNode")
											.style("fill","#797979")

											.style("stroke","#52CC52")
											.style("stroke-width", 2)
											.attr("x",function(d){
											  return -d.qField.length*3;
											})
											.attr("y",-10);
											//.attr("transform","translate(-40,-10)");


											node.append("svg:text")
											.attr("x", 7)
											.attr("y", 5)
											.attr('class', 'nodeText')
											.attr("text-anchor", "middle")
											.text(function(d) { return d.qField; });




											/* function checkNote(mark) {
												finalNote.forEach(function(pathItem){
													if(pathItem.pathName == mark){
														console.log(pathItem.pathNote);
														return pathItem.pathNote;											
													}
												});
											
											} */


											function mouseover(d) {
												div.transition()
												.duration(300)
												.style("opacity", 1);
												//aside.html('<strong>' + d.note + '</strong>').style("visibility", "visible");
												//console.log(d.note)
												/* aside.html(function(){ 
												  
												  return '<p class="notetip"><em>"' + d.mark + '"</em></p>';
												  
												})
												.style("visibility", "visible"); */
												
											}

											function mousemove(d) {
												var listValue = "";
												var i;
												if(typeof(d.qSelected)== 'string') {
													listValue += d.qSelected;
												}else {
													for (i = 0; i < d.qSelected.length; i++) {
														listValue += d.qSelected[i] + "<br>";
												    }
												};
												
												div
												//.text("Selections for " + d.field + ":" + d.value)
												.html(function(){ 
												  var nodePath = d.mark;
												  //console.log(nodePath);
												  return "<button class='popMark'><span class='lui-icon lui-icon--small lui-icon--tag'></span>" + d.mark + "</button><br>"+ "<lui-button x-variant='inverse' class='pathName'>"+ d.qField + "</lui-button>" + "<p>" + listValue + "</p>"; 
											   })
												.style("left", (d3.event.pageX ) + "px")
												.style("top", (d3.event.pageY) + "px");
												//
												/* aside.html(function(){ 
												  
												  return '<p class="notetip"><em>"' + d.mark + '"</em></p>';
												  
												})
												.style("visibility", "visible"); */
												
											}

											function mouseout(d) {
												div.transition()
												.duration(500)
												.style("opacity", 1e-6);
												/* aside.html(function(){ 
												 
												  return '<p class="notetip"><em>"' + d.mark + '"</em></p>';
												  
												})
												.style("visibility", "hidden"); */
												
											}   
										
										//};	
											
										
										
									});					 
									
									
									
									
									

								
								

							}
						};
				}); 


			
				
				
				
				
			}]
		   
	
			
			
		};

	} );

