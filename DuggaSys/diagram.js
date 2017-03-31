var querystring=parseGet();
var retdata;

AJAXService("get",{},"DIAGRAM");

   	
/* 

-----------------------=====================##################=====================-----------------------
		Layout (curve drawing tools)
-----------------------=====================##################=====================-----------------------

		Path - A collection of segments
				fill color
				line color
				a number of segments
	 Segment - A collection of curves connecting points
	 Point - A 2d coordinate

*/   

// Global settings

var crossl=4.0;				// Size of point cross
var ctx;							// Canvas context
var acanvas;					// Canvas Element
var sel;							// Selection state
var cx,cy=0;					// Current Mouse coordinate x and y
var sx,sy=0;					// Start Mouse coordinate x and y
var mox,moy=0;				// Old mouse x and y
var md=0;							// Mouse state
var movobj=-1;				// Moving object ID
var uimode="normal";		// User interface mode e.g. normal or create class currently

//--------------------------------------------------------------------
// points - stores a global list of points
// A point can not be physically deleted but marked as deleted in order to reuse
// the sequence number again. e.g. point[5] will remain point[5] until it is deleted
//--------------------------------------------------------------------

var points=[
						// Path A -- Segment 1 (0,1,2,3)
						{x:20,y:200,selected:0},{x:60,y:200,selected:0},{x:100,y:40,selected:0},{x:140,y:40,selected:0},
						// Path B -- Segment 1 (4,5 and 17,18)
						{x:180,y:200,selected:0},{x:220,y:200,selected:0},
						// Path A -- Segment 2 (6,7,8,9)
						{x:300,y:250,selected:0},{x:320,y:250,selected:0},{x:320,y:270,selected:0},{x:300,y:270,selected:0},
            // Path C -- Segment 1 (10,11,12,13)
            {x:70,y:130,selected:0},{x:70,y:145,selected:0},{x:170,y:130,selected:0},{x:170,y:145,selected:0},
            // Class A -- TopLeft BottomRight MiddleDivider 14,15,16
            {x:310,y:60,selected:0},{x:400,y:160,selected:0},{x:355,y:115,selected:0},
						// Path B -- Segment 1 (4,5 and 17,18)
            {x:100,y:40,selected:0},{x:140,y:40,selected:0},
						// ER Attribute A -- TopLeft BottomRight MiddlePointConnector 19,20,21            
            {x:300,y:200,selected:0},{x:400,y:250,selected:0},{x:350,y:225,selected:0},
						// ER Attribute B -- TopLeft BottomRight MiddlePointConnector 22,23,24            
            {x:300,y:275,selected:0},{x:400,y:325,selected:0},{x:350,y:300,selected:0},
						// ER Entity A -- TopLeft BottomRight MiddlePointConnector 25,26,27            
            {x:150,y:275,selected:0},{x:250,y:325,selected:0},{x:200,y:300,selected:0},
						// ER Entity Connector Right Points -- 28,29
            {x:225,y:290,selected:1},
            {x:225,y:310,selected:1},

						// ER Attribute C -- TopLeft BottomRight MiddlePointConnector 30,31,32            
					  {x:15,y:275,selected:0},{x:115,y:325,selected:0},{x:65,y:300,selected:0},
						// ER Attribute D -- TopLeft BottomRight MiddlePointConnector 33,34,35            
						{x:15,y:350,selected:0},{x:115,y:400,selected:0},{x:65,y:375,selected:0},
						// ER Attribute E -- TopLeft BottomRight MiddlePointConnector 36,37,38            
            {x:15,y:200,selected:0},{x:115,y:250,selected:0},{x:65,y:225,selected:0},
					  
						// ER Entity Connector Left Points -- 39,40,41
					  {x:150,y:225,selected:0},
					  {x:150,y:235,selected:0},
					  {x:150,y:245,selected:0},
					  
           ];

//--------------------------------------------------------------------
// addpoint
// Creates a new point and returns index of that point
//--------------------------------------------------------------------

points.addpoint = function (xk,yk,selval)
{
		var newpnt={x:xk,y:yk,selected:selval};
		
		var pos=this.length;
		this.push(newpnt);
		return pos;
}

//--------------------------------------------------------------------
// drawpoints
// Draws each of the points as a cross
//--------------------------------------------------------------------

points.drawpoints = function ()
{
		// Mark points
		ctx.strokeStyle="#f64";
		ctx.lineWidth=2;
		for(var i=0;i<this.length;i++){
				var point=this[i];
				
				if(point.selected==0){
						ctx.beginPath();
						ctx.moveTo(point.x-crossl,point.y-crossl);
						ctx.lineTo(point.x+crossl,point.y+crossl);
						ctx.moveTo(point.x+crossl,point.y-crossl);
						ctx.lineTo(point.x-crossl,point.y+crossl);
						ctx.stroke();
				}else{
						ctx.save();
						ctx.fillStyle="#d51";
						ctx.strokeStyle="#420";
						ctx.fillRect(point.x-crossl,point.y-crossl,crossl*2,crossl*2);
						ctx.strokeRect(point.x-crossl,point.y-crossl,crossl*2,crossl*2);
						ctx.restore();
				}
								
		}
		ctx.lineWidth=1;		
}

//--------------------------------------------------------------------
// distancepoint
// Returns the distance to closest point and the index of that point
//--------------------------------------------------------------------

points.distance = function(xk,yk)
{
		var dist=50000000;
		var ind=-1;
		for(i=0;i<this.length;i++){
				var dx=xk-this[i].x;
				var dy=yk-this[i].y;
				
				var dd=(dx*dx)+dy*dy;
				if(dd<dist){
						dist=dd;
						ind=i;
				}
		}
		
		return {dist:Math.sqrt(dist),ind:ind};
}

//--------------------------------------------------------------------
// distancepoint
// Returns the distance to closest point and the index of that point
//--------------------------------------------------------------------

points.clearsel = function()
{
		for(i=0;i<this.length;i++){
				this[i].selected=0;
		}		
}

//--------------------------------------------------------------------
// diagram - stores a global list of diagram objects
// A diagram object could for instance be a path, or a symbol
//--------------------------------------------------------------------

var diagram=[];

//--------------------------------------------------------------------
// draw - executes draw methond in all diagram objects
//--------------------------------------------------------------------

diagram.draw = function ()
{
		// On every draw of diagram adjust the midpoint if there is one to adjust
		this.adjust();
		
		for(i=0;i<this.length;i++){
				item=this[i];
				
				// Path item
				if(item.kind==1){
						item.draw(1,1);						
				}else if(item.kind==2){
						item.draw();
				}
				
		}
}

//--------------------------------------------------------------------
// adjust - adjusts all the fixed midpoints or other points of interest to the actual geometric midpoint of the symbol
//--------------------------------------------------------------------

diagram.adjust = function ()
{
		for(i=0;i<this.length;i++){
				item=this[i];
				
				// Diagram item
				if(item.kind==2){
						item.adjust();						
				}
				
		}
		
}

//--------------------------------------------------------------------
// inside - executes inside methond in all diagram objects (currently of kind==2)
//--------------------------------------------------------------------

diagram.inside = function (xk,yk)
{
		for(i=0;i<this.length;i++){
				item=this[i];
				
				if(item.kind==2){
						var insided=item.inside(xk,yk);
						if(insided==true) return i;
				}
				
		}
		
		return -1;
}


//--------------------------------------------------------------------
// inside - executes linedist methond in all diagram objects (currently of kind==2)
//--------------------------------------------------------------------

diagram.linedist = function (xk,yk)
{
		for(i=0;i<this.length;i++){
				item=this[i];
				
				if(item.kind==2){
						var insided=item.linedist(xk,yk);
						if(insided!=-1&&insided<15){
								item.sel=true;
						}else{
								item.sel=false;
						}
				}
				
		}
		
		return -1;
}


//--------------------------------------------------------------------
// path - stores a number of segments
//--------------------------------------------------------------------

function Path() {
		this.kind=1;							// Path kind
				
		this.segments=Array();		// Segments
		this.sel;									// Selected object info
		this.intarr=Array();			// Intersection list (one list per segment)

		this.tmplist=Array();			// Temporary list for testing of intersections
		this.auxlist=Array();			// Auxillary temp list for testing of intersections
		
		this.fillColor="#48B";		// Fill color (default is blueish)
		this.strokeColor="#246";	// Stroke color (default is dark blue)
		this.Opacity=0.5;					// Opacity (default is 50%)
		this.linewidth=3;					// Line Width (stroke width - default is 3 pixels)
		
		this.isorganized=true;			// This is true if segments are organized e.g. can be filled using a single command since segments follow a path 1,2-2,5-5,9 etc
																// An organized path can contain several sub-path, each of which must be organized
		
		//--------------------------------------------------------------------
		// move
		// Performs a delta-move on all points in a path
		//--------------------------------------------------------------------
		
    this.move = function(movex,movey)
    {
						// Mar all segment points as unmoved
						for(var i=0;i<this.segments.length;i++){
								var seg=this.segments[i];
								points[seg.pa].moved=false;
								points[seg.pb].moved=false;
						}
						
						// Move segments that have not previously been moved
						for(var i=0;i<this.segments.length;i++){
								var seg=this.segments[i];
								
								if(points[seg.pa].moved==false){
										points[seg.pa].x+=movex;
										points[seg.pa].y+=movey;
										points[seg.pa].moved=true;
								}
								if(points[seg.pb].moved==false){
										points[seg.pb].x+=movex;
										points[seg.pb].y+=movey;
										points[seg.pb].moved=true;
								}

						}				
    }

		//--------------------------------------------------------------------
		// addsegment
		// Adds a segment to a path
		//--------------------------------------------------------------------
		
    this.addsegment = function(kind, p1, p2, p3, p4, p5, p6, p7, p8)
    {
    		// Line segment (only kind of segment at the moment)
    		if(kind==1){
    				// Only push segment if it does not already exist
    				if(!this.existsline(p1,p2,this.segments)){
    						this.segments.push({kind:1,pa:p1,pb:p2});    				
    				}
    		}else{
    				alert("Unknown segment type: "+kind);
    		}
    }
    
		//--------------------------------------------------------------------
		// addsegment
		// Draws filled path to screen (or svg when that functionality is added)
		//--------------------------------------------------------------------

    this.draw = function (fillstate, strokestate)
    {
				if(this.isorganized==false) alert("Only organized paths can be filled!");
				if(this.segments.length>0){
						
						// Assign stroke style, color, transparency etc
						ctx.strokeStyle=this.strokeColor;
						ctx.fillStyle=this.fillColor;
						ctx.globalAlpha=this.Opacity;
						ctx.lineWidth=this.linewidth; 
						ctx.beginPath();

						var pseg=this.segments[0];
						ctx.moveTo(points[pseg.pa].x,points[pseg.pa].y);
						for(var i=0;i<this.segments.length;i++){
								var seg=this.segments[i];
								
								// If we start over on another sub-path, we must start with a moveto
								if(seg.pa!=pseg.pb){
										ctx.moveTo(points[seg.pa].x,points[seg.pa].y);								
								}
								
								// Draw current line
								ctx.lineTo(points[seg.pb].x,points[seg.pb].y);
								
								// Remember previous segment
								pseg=seg;
						}
						
						// Make either stroke or fill or both -- stroke always after fill
						if(fillstate) ctx.fill();
						if(strokestate) ctx.stroke();
						
						// Reset opacity so that following draw operations are unaffected
						ctx.globalAlpha=1.0;
				}

    }

		//--------------------------------------------------------------------
		// inside
		// Returns true if coordinate xk,yk falls inside the bounding box of the symbol
		//--------------------------------------------------------------------    
    
    this.inside = function (xk,yk) 
		{
						// Count Crossing linear segments
						var crosses=0;
						
						// Check against segment list
						for(var i=0;i<this.segments.length;i++){
								var item=this.segments[i];
		
								var pax=points[item.pa].x;
								var pbx=points[item.pb].x;
								var pay=points[item.pa].y;
								var pby=points[item.pb].y;
		
								var dx=pbx-pax;
								var dy=pby-pay;
								var dd=dx/dy;

								// Returning working cross even if line goes top to bottom		
								if(pby<pay){
										if (yk>pby&&yk<pay&&((((yk-pay)*dd)+pax)<xk)){
												crosses++;
										}						
								}else{
										if (yk>pay&&yk<pby&&((((yk-pay)*dd)+pax)<xk)){
												crosses++;
										}												
								}
		
						}
						
						// Add one to reverse truth value e.g. 0 if 1 etc		
						return (crosses+1)%2;				
		}


		//--------------------------------------------------------------------
		// recursetest
		// Recursively splits a line at intersection points from top to bottom until there is no line left
		//--------------------------------------------------------------------    

		this.recursetest = function(p1,p2)
		{
				var yk=5000;
				var endres=null;
				for(var i=0;i<this.segments.length;i++){
						bitem=this.segments[i];
						var result=this.intersection(p1,p2,bitem.pa,bitem.pb);				
						if(result.state==true&&result.y<yk){
								yk=result.y;
								endres=result;
						}				
				}
				if(yk!=5000){
						// Create new point (if it does not already exist)
						pointno=points.length
						points.push({x:endres.x,y:endres.y});
		
						// Depending on direction of p1 and p2
						if(points[p2].y<points[p1].y){
								this.tmplist.push({kind:1,pa:pointno,pb:p2});
								this.recursetest(pointno,p1);
						}else{
								this.tmplist.push({kind:1,pa:pointno,pb:p1});				
								this.recursetest(pointno,p2);
						}
				}else{
						this.tmplist.push({kind:1,pa:p1,pb:p2});
				}
		}

		//--------------------------------------------------------------------
		// intersection
		// Line to line intersection
		// Does not detect intersections on end points (we do not want end points to be part of intersection set)
		//--------------------------------------------------------------------    

		this.intersection = function(p1,p2,p3,p4) {
		
				var x1=points[p1].x;
				var y1=points[p1].y;
				
				var x2=points[p2].x;
				var y2=points[p2].y;
				
				var x3=points[p3].x;
				var y3=points[p3].y;
				
				var x4=points[p4].x;
				var y4=points[p4].y;
				
				// Basic fix for straight lines
				if(x1==x2) x2+=0.01;
				if(y1==y2) y2+=0.01;
				if(x3==x4) x4+=0.01;
				if(y3==y4) y4+=0.01;
		
		    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
		    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
		
		    if (isNaN(x)||isNaN(y)) {
		        return {state:false,x:0,y:0};;
		    } else {
		        if (x1>=x2) {
		            if (!(x2<x&&x<x1)) return {state:false,x:0,y:0};
		        } else {
		            if (!(x1<x&&x<x2)) return {state:false,x:0,y:0};
		        }
		        if (y1>=y2) {
		            if (!(y2<y&&y<y1)) return {state:false,x:0,y:0};
		        } else {
		            if (!(y1<y&&y<y2)) return {state:false,x:0,y:0};
		        }
		        if (x3>=x4) {
		            if (!(x4<x&&x<x3)) return {state:false,x:0,y:0};
		        } else {
		            if (!(x3<x&&x<x4)) return {state:false,x:0,y:0};
		        }
		        if (y3>=y4) {
		            if (!(y4<y&&y<y3)) return {state:false,x:0,y:0};
		        } else {
		            if (!(y3<y&&y<y4)) return {state:false,x:0,y:0};
		        }
		    }
		    return {state:true,x:x,y:y};;
		}
		
		//--------------------------------------------------------------------
		// existsline
		// Checks if a line already exists but in the reverse direction
		// Only checks lines, not bezier curves
		//--------------------------------------------------------------------    
		
		this.existsline = function (p1,p2,segmentset)
		{
				if(p1==p2) return true;
				for(var i=0;i<segmentset.length;i++){
						var segment=segmentset[i];
						if((segment.pa==p1&&segment.pb==p2)||(segment.pa==p2&&segment.pb==p1)) return true;
				}
				return false;
		}
		
		//--------------------------------------------------------------------
		// recursetest
		// Line to line intersection
		// Does not detect intersections on end points (we do not want end points to be part of intersection set)
		//--------------------------------------------------------------------    

		this.boolOp = function (otherpath)
		{				
				// Clear temporary lists used for merging paths
				this.tmplist=[];
				this.auxlist=[];
				otherpath.tmplist=[];
				otherpath.auxlist=[];

				// Recurse local segment set and check for crossing lines
				for(var i=0;i<otherpath.segments.length;i++){
						var item=otherpath.segments[i];
						this.recursetest(item.pa,item.pb);
				}
				
				// Check if each segment is inside the joining set
				for(var i=0;i<this.tmplist.length;i++){
						var item=this.tmplist[i];

						// Check if center of line is inside or outside
						var p1=points[item.pa];
						var p2=points[item.pb];
						var xk=(p1.x+p2.x)*0.5;
						var yk=(p1.y+p2.y)*0.5;				
		
						if(this.inside(xk,yk,otherpath)){
    						if(!this.existsline(item.pa,item.pb,this.auxlist)){
										this.auxlist.push(item);
								}
						}
				}
				
				// Recurse into joining segment set and check for crossing lines
				for(var i=0;i<this.segments.length;i++){
						var item=this.segments[i];
						otherpath.recursetest(item.pa,item.pb);
				}
				
				// Check if each segment is inside the local set
				for(var i=0;i<otherpath.tmplist.length;i++){
						var item=otherpath.tmplist[i];

						// Check if center of line is inside or outside
						var p1=points[item.pa];
						var p2=points[item.pb];
						var xk=(p1.x+p2.x)*0.5;
						var yk=(p1.y+p2.y)*0.5;				
		
						if(otherpath.inside(xk,yk,this)){
    						if(!this.existsline(item.pa,item.pb,this.auxlist)){
										this.auxlist.push(item);
								}
						}
				}
				
				alert(this.auxlist.length);
												
				this.drawsegments(this.auxlist);
		}
		
		//--------------------------------------------------------------------
		// drawsegments
		// Debug drawing of a segment set (for example for drawing tmplist, auxlist etc)
		//--------------------------------------------------------------------    

		this.drawsegments = function (segmentlist, color)
		{				
				// Draw aux set
				ctx.lineWidth=1;
				ctx.strokeStyle="#46f";
				for(var i=0;i<segmentlist.length;i++){
						var line=segmentlist[i];
		
						// If line is a straight line				
						if(line.kind==1){
								ctx.beginPath();
								ctx.moveTo(points[line.pa].x,points[line.pa].y);
								ctx.lineTo(points[line.pb].x,points[line.pb].y);
								ctx.stroke();
						}
						
				}		
		}
}

//--------------------------------------------------------------------
// Symbol - stores a diagram symbol
//--------------------------------------------------------------------

function Symbol(kind) {
		this.kind=2;									// Diagram object kind is always 2 for symbols
		
		this.symbolkind=kind;					// Symbol kind (1 UML diagram symbol 2 ER Attribute)
		
		this.operations=[];						// Operations array
		this.attributes=[];						// Attributes array
		
		this.textsize=14;							// 14 pixels text size is default
		this.name="New Class";		// Default name is new class
		
		this.topLeft;									// Top Left Point
		this.bottomRight;							// Bottom Right Point
		this.middleDivider;						// Middle divider Point
		
		this.centerpoint;							// Centerpoint
		
		// Connector arrays - for connecting and sorting relationships between diagram objects
		this.connectorTop=[];
		this.connectorBottom=[];
		this.connectorLeft=[];
		this.connectorRight=[];


		//--------------------------------------------------------------------
		// getquadrant
		// Returns the quadrant for a x,y coordinate in relation to bounding box and box center
		// Quadrant Layout:
		//       0|1     Top = 0     Right = 1
 		//      -----    Bottom = 2  Left = 3
		//       3|2     
		//--------------------------------------------------------------------    

		this.getquadrant = function (xk,yk)
		{
				// Read cardinal points
				var x1=points[this.topLeft].x;
				var y1=points[this.topLeft].y;
				var x2=points[this.bottomRight].x;
				var y2=points[this.bottomRight].y;
				var vx=points[this.centerpoint].x;
				var vy=points[this.centerpoint].y;

				// Compute deltas and k
				var dx=x1-vx;
				var dy=y1-vy;
				var k=dy/dx;

				if(xk>vx){
						if(yk>vy){
								// Bottom right quadrant
								var byk=vy+(k*(xk-vx));
								if(yk>byk) return 2;
								return 1;													
						}else{
								// Top right quadrant
								var byk=vy-(k*(xk-vx));
								if(yk>byk) return 1;
								return 0;					
						}
				}else{
						if(yk>vy){
								// Bottom left quadrant
								var byk=vy-(k*(xk-vx));
								if(yk>byk) return 2;
								return 3;					
						}else{
								// Top left quadrant
								var byk=(k*(xk-vx))+vy;
								if(yk>byk) return 3;
								return 0;					
						}				
				}
				return -1;
		}
		
		//--------------------------------------------------------------------
		// quadrants
		// Iterates over all relation ends and checks if any need to change quadrants
		//--------------------------------------------------------------------    

		this.quadrants = function ()
		{
				
				// Fix right connector box (1)
				var i=0;
				while(i<this.connectorRight.length){
						var xk=points[this.connectorRight[i].to].x;
						var yk=points[this.connectorRight[i].to].y;		
						var bb=this.getquadrant(xk,yk);
						if(bb==3){
								conn=this.connectorRight.splice(i,1);
								this.connectorLeft.push(conn[0]);
						}else if(bb==0){
								conn=this.connectorRight.splice(i,1);
								this.connectorTop.push(conn[0]);
						}else if(bb==2){
								conn=this.connectorRight.splice(i,1);
								this.connectorBottom.push(conn[0]);
						}else{
								i++;
						}
				}

				// Fix left connector box (3)
				var i=0;
				while(i<this.connectorLeft.length){
						var xk=points[this.connectorLeft[i].to].x;
						var yk=points[this.connectorLeft[i].to].y;		
						var bb=this.getquadrant(xk,yk);
						if(bb==1){
								conn=this.connectorLeft.splice(i,1);
								this.connectorRight.push(conn[0]);
						}else if(bb==0){
								conn=this.connectorLeft.splice(i,1);
								this.connectorTop.push(conn[0]);
						}else if(bb==2){
								conn=this.connectorLeft.splice(i,1);
								this.connectorBottom.push(conn[0]);
						}else{
								i++;
						}
				}

				// Fix top connector box (0)
				var i=0;
				while(i<this.connectorTop.length){
						var xk=points[this.connectorTop[i].to].x;
						var yk=points[this.connectorTop[i].to].y;		
						var bb=this.getquadrant(xk,yk);
						if(bb==1){
								conn=this.connectorTop.splice(i,1);
								this.connectorRight.push(conn[0]);
						}else if(bb==3){
								conn=this.connectorTop.splice(i,1);
								this.connectorLeft.push(conn[0]);
						}else if(bb==2){
								conn=this.connectorTop.splice(i,1);
								this.connectorBottom.push(conn[0]);
						}else{
								i++;
						}
				}

				// Fix bottom connector box (2)
				var i=0;
				while(i<this.connectorBottom.length){
						var xk=points[this.connectorBottom[i].to].x;
						var yk=points[this.connectorBottom[i].to].y;		
						var bb=this.getquadrant(xk,yk);
						if(bb==1){
								conn=this.connectorBottom.splice(i,1);
								this.connectorRight.push(conn[0]);
						}else if(bb==3){
								conn=this.connectorBottom.splice(i,1);
								this.connectorLeft.push(conn[0]);
						}else if(bb==0){
								conn=this.connectorBottom.splice(i,1);
								this.connectorTop.push(conn[0]);
						}else{
								i++;
						}
				}
		}

		//--------------------------------------------------------------------
		// adjust
		// Moves midpoint or other fixed point to geometric center of object again
		//--------------------------------------------------------------------    

		this.adjust = function ()
		{
				var x1=points[this.topLeft].x;
				var y1=points[this.topLeft].y;
				var hw=(points[this.bottomRight].x-x1)*0.5;
				var hh=(points[this.bottomRight].y-y1)*0.5;

				if(this.symbolkind==2||this.symbolkind==3){
						points[this.centerpoint].x=x1+hw;
						points[this.centerpoint].y=y1+hh;
				}else if(this.symbolkind==1){
						// Place middle divider point in middle between x1 and y1
						points[this.middleDivider].x=x1+hw;
						
						// If middle divider is below y2 set y2 to middle divider
						if(points[this.middleDivider].y>points[this.bottomRight].y) points[this.bottomRight].y=points[this.middleDivider].y;
				}
		}

		//--------------------------------------------------------------------
		// sortConnector
		// Sorts the connector
		//--------------------------------------------------------------------    

		this.sortConnector = function (connector,direction,start,end,otherside)
		{
				var pointcnt=connector.length+1;
				var delta=(end-start)/pointcnt;
				
				if(direction==1){
						// Vertical connector
						connector.sort(function(a, b) {
								var y1=points[a.to].y;
								var y2=points[b.to].y;
								
								return y1-y2;
						});
						var ycc=start;
						for(var i=0;i<connector.length;i++){
								ycc+=delta;
								points[connector[i].from].y=ycc;	
								points[connector[i].from].x=otherside;	
						}
				}else{
						connector.sort(function(a, b) {
								var x1=points[a.to].x;
								var x2=points[b.to].x;
								
								return x1-x2;
						});
						var ycc=start;
						for(var i=0;i<connector.length;i++){
								ycc+=delta;
								points[connector[i].from].y=otherside;	
								points[connector[i].from].x=ycc;	
						}
				}
				
//				consloe.log(pointcnt);
		}

		//--------------------------------------------------------------------
		// sortAllConnectors
		// Sorts all connectors
		//--------------------------------------------------------------------    

		this.sortAllConnectors = function ()
		{
				var x1=points[this.topLeft].x;
				var y1=points[this.topLeft].y;
				var x2=points[this.bottomRight].x;
				var y2=points[this.bottomRight].y;

				this.sortConnector(this.connectorRight,1,y1,y2,x2);
				this.sortConnector(this.connectorLeft,1,y1,y2,x1);
				this.sortConnector(this.connectorTop,2,x1,x2,y1);
				this.sortConnector(this.connectorBottom,2,x1,x2,y2);

		}
				
		//--------------------------------------------------------------------
		// move
		// Returns true if xk,yk is inside the bounding box of the symbol
		//--------------------------------------------------------------------    

		this.inside = function (xk,yk)
		{
				var x1=points[this.topLeft].x;
				var y1=points[this.topLeft].y;
				var x2=points[this.bottomRight].x;
				var y2=points[this.bottomRight].y;
				
				if(xk>x1&&xk<x2&&yk>y1&&yk<y2){
						return true;
				}else{
						return false;
				}
		}

		//--------------------------------------------------------------------
		// linedist
		// Returns line distance to segment object e.g. line objects (currently only relationship markers)
		//--------------------------------------------------------------------    

		this.linedist = function (xk,yk)
		{
				if(this.symbolkind==4){
						var x1=points[this.topLeft].x;
						var y1=points[this.topLeft].y;
						var x2=points[this.bottomRight].x;
						var y2=points[this.bottomRight].y;						
							
						var px = x2-x1;
						var py = y2-y1;
						var len = px*px + py*py;
						var u = ((xk - x1) * px + (yk - y1) * py) / len;						

						if(u > 1){
								u = 1;
						}else if(u < 0){
								u = 0;				
						}
						
						var x = x1 + u * px;
						var y = y1 + u * py;
						px = x - xk;
						py = y - yk;
						
						dst = px*px + py*py;

						return dst;

				}else{
						return -1;				
				}

		}

		//--------------------------------------------------------------------
		// move
		// Updates all points referenced by symbol
		//--------------------------------------------------------------------    

		this.move = function (movex,movey)
		{
				points[this.topLeft].x+=movex;
				points[this.topLeft].y+=movey;
				points[this.bottomRight].x+=movex;
				points[this.bottomRight].y+=movey;			
				if(this.symbolkind==1){
						points[this.middleDivider].x+=movex;
						points[this.middleDivider].y+=movey;			
				}else if(this.symbolkind==2){
						points[this.centerpoint].x+=movex;
						points[this.centerpoint].y+=movey;			
				}
		}

		//--------------------------------------------------------------------
		// draw
		// Redraws graphics
		//--------------------------------------------------------------------    

		this.draw = function ()
		{
					var x1=points[this.topLeft].x;
					var y1=points[this.topLeft].y;
					
					var x2=points[this.bottomRight].x;
					var y2=points[this.bottomRight].y;
					
					if(this.symbolkind==1){
							var midy=points[this.middleDivider].y;
		
							ctx.font="bold "+parseInt(this.textsize)+"px Arial";
		
							// Clear Class Box
							ctx.fillStyle="#fff";
							ctx.fillRect(x1,y1,x2-x1,y2-y1);
							ctx.fillStyle="#246";
		
							// Write Class Name
							ctx.textAlign="center";
							ctx.textBaseline = "middle"; 
							ctx.fillText(this.name,x1+((x2-x1)*0.5),y1+(0.85*this.textsize));
		
							// Change Alignment and Font
							ctx.textAlign="start";
							ctx.textBaseline = "top"; 
							ctx.font=parseInt(this.textsize)+"px Arial";
		
							// Clipping of text and drawing of attributes
							ctx.save();
							ctx.beginPath();
							ctx.moveTo(x1,y1+(this.textsize*1.5));
							ctx.lineTo(x2,y1+(this.textsize*1.5));
							ctx.lineTo(x2,midy);
							ctx.lineTo(x1,midy);					
							ctx.lineTo(x1,y1+(this.textsize*1.5));
							ctx.clip();
							for(var i=0;i<this.attributes.length;i++){
									ctx.fillText(this.attributes[i].visibility+" "+this.attributes[i].text,x1+(this.textsize*0.3),y1+(this.textsize*1.7)+(this.textsize*i));					
							}
							ctx.restore();
		
							// Clipping of text and drawing of methods
							ctx.save();
							ctx.beginPath();
							ctx.moveTo(x1,midy);
							ctx.lineTo(x2,midy);
							ctx.lineTo(x2,y2);
							ctx.lineTo(x1,y2);					
							ctx.lineTo(x1,midy);
							ctx.clip();
							ctx.textAlign="start";
							ctx.textBaseline = "top"; 
							for(var i=0;i<this.operations.length;i++){
									ctx.fillText(this.operations[i].visibility+" "+this.operations[i].text,x1+(this.textsize*0.3),midy+(this.textsize*0.2)+(this.textsize*i));					
							}
							ctx.restore();
							
							// Box
		
							ctx.beginPath();				
							ctx.moveTo(x1,y1);
							ctx.lineTo(x2,y1);
							ctx.lineTo(x2,y2);	
							ctx.lineTo(x1,y2);
							ctx.lineTo(x1,y1);
							
							// Top Divider
							ctx.moveTo(x1,y1+(this.textsize*1.5));
							ctx.lineTo(x2,y1+(this.textsize*1.5));
							
							// Middie Divider
							ctx.moveTo(x1,midy);
							ctx.lineTo(x2,midy);					
							
							ctx.stroke();
					}else if(this.symbolkind==2){

							// Write Attribute Name
							ctx.textAlign="center";
							ctx.textBaseline = "middle"; 

							drawOval(x1,y1,x2,y2);					
							ctx.fillStyle="#dfe";
							ctx.fill();
							ctx.strokeStyle="#253";
							ctx.stroke();

							ctx.fillStyle="#253";
							ctx.fillText(this.name,x1+((x2-x1)*0.5),(y1+((y2-y1)*0.5)));
					}else if(this.symbolkind==3){

							// Write Attribute Name
							ctx.textAlign="center";
							ctx.textBaseline = "middle"; 

							ctx.beginPath();
							ctx.moveTo(x1,y1);
							ctx.lineTo(x2,y1);
							ctx.lineTo(x2,y2);
							ctx.lineTo(x1,y2);
							ctx.lineTo(x1,y1);
							
							ctx.fillStyle="#dfe";
							ctx.fill();
							ctx.strokeStyle="#253";
							ctx.stroke();

							ctx.fillStyle="#253";
							ctx.fillText(this.name,x1+((x2-x1)*0.5),(y1+((y2-y1)*0.5)));

					}else if(this.symbolkind==4){
							// ER Attribute relationship is a single line					
							if(this.sel){
									ctx.strokeStyle="#F82";							
							}else{
									ctx.strokeStyle="#000";														
							}
							ctx.beginPath();
							ctx.moveTo(x1,y1);
							ctx.lineTo(x2,y2);							
							ctx.stroke();

							ctx.strokeStyle="#000";														

					}
		
		}
		
}

function initcanvas()
{
    var canvas = document.getElementById("myCanvas");
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
				acanvas=document.getElementById("myCanvas");
		}
	
		makegfx();
		
		updategfx();

} 

var erEntityA;

// Demo data for testing purposes.

function makegfx()
{
		// Declare three paths
		var pathA=new Path;
		var pathB=new Path;
		var pathC=new Path;
	
		// Add segments to paths
		pathA.addsegment(1,0,1);
		pathA.addsegment(1,1,3);
		pathA.addsegment(1,3,2);
		pathA.addsegment(1,2,0);

		pathA.addsegment(1,6,7);
		pathA.addsegment(1,7,8);
		pathA.addsegment(1,8,9);
		pathA.addsegment(1,9,6);

		pathB.addsegment(1,18,17);
		pathB.addsegment(1,17,4);
		pathB.addsegment(1,4,5);
		pathB.addsegment(1,5,18);
		
		pathC.addsegment(1,10,11);
		pathC.addsegment(1,11,13);
		pathC.addsegment(1,13,12);
		pathC.addsegment(1,12,10);
		
		// Create a UML Class and add three attributes, two operations and a name
		classA = new Symbol(1);
		
		classA.name="Person";		

		classA.operations.push({visibility:"+",text:"hold(name:String)"});
		classA.operations.push({visibility:"-",text:"makemore()"});		

		classA.attributes.push({visibility:"+",text:"height:Integer"});
		classA.attributes.push({visibility:"#",text:"at:Large"});		
		classA.attributes.push({visibility:"-",text:"megalomania:Real"});	
		
		classA.topLeft=14;
		classA.bottomRight=15;	
		classA.middleDivider=16;	

		erAttributeA = new Symbol(2);
		erAttributeA.name="SSN";		
		erAttributeA.topLeft=19;
		erAttributeA.bottomRight=20;	
		erAttributeA.centerpoint=21;	

		erAttributeB = new Symbol(2);
		erAttributeB.name="Name";		
		erAttributeB.topLeft=22;
		erAttributeB.bottomRight=23;	
		erAttributeB.centerpoint=24;	

		erAttributeC = new Symbol(2);
		erAttributeC.name="Smell";		
		erAttributeC.topLeft=30;
		erAttributeC.bottomRight=31;	
		erAttributeC.centerpoint=32;	

		erAttributeD = new Symbol(2);
		erAttributeD.name="Stink";		
		erAttributeD.topLeft=33;
		erAttributeD.bottomRight=34;	
		erAttributeD.centerpoint=35;	

		erAttributeE = new Symbol(2);
		erAttributeE.name="Verisimilitude";		
		erAttributeE.topLeft=36;
		erAttributeE.bottomRight=37;	
		erAttributeE.centerpoint=38;	
		
		erEntityA = new Symbol(3);
		erEntityA.name="Person";		
		erEntityA.topLeft=25;
		erEntityA.bottomRight=26;	
		erEntityA.centerpoint=27;
		
		erattributeRelA = new Symbol(4);
		erattributeRelA.topLeft=28;
		erattributeRelA.bottomRight=24;	

		erattributeRelB = new Symbol(4);
		erattributeRelB.topLeft=29;
		erattributeRelB.bottomRight=21;	

		// We connect the connector point to the middle point of the attribute in this case
		erattributeRelC = new Symbol(4);
		erattributeRelC.topLeft=39;
		erattributeRelC.bottomRight=32;	

		erattributeRelD = new Symbol(4);
		erattributeRelD.topLeft=40;
		erattributeRelD.bottomRight=35;	

		erattributeRelE = new Symbol(4);
		erattributeRelE.topLeft=41;
		erattributeRelE.bottomRight=38;	
		
		erEntityA.connectorRight.push({from:28,to:24});
		erEntityA.connectorRight.push({from:29,to:21});

		erEntityA.connectorLeft.push({from:40,to:35});
		erEntityA.connectorLeft.push({from:39,to:32});

		erEntityA.connectorTop.push({from:41,to:38});

		// Add all elements to diagram		
		diagram.push(pathA);
		diagram.push(pathB);
		diagram.push(pathC);

		diagram.push(classA);
		diagram.push(erAttributeA);
		diagram.push(erAttributeB);
		diagram.push(erAttributeC);
		diagram.push(erAttributeD);
		diagram.push(erAttributeE);
		diagram.push(erEntityA);
		diagram.push(erattributeRelA);
		diagram.push(erattributeRelB);
		diagram.push(erattributeRelC);
		diagram.push(erattributeRelD);
		diagram.push(erattributeRelE);
		
}

function updategfx()
{		
		ctx.clearRect(0,0,600,600);

		// Here we explicitly sort connectors... we need to do this dynamically e.g. diagram.sortconnectors
		erEntityA.sortAllConnectors();

		// Redraw diagram
		diagram.draw();

// Make a bool operation between PathA and PathB
//		pathA.boolOp(pathC);
		
		// Draw all points as crosses
		points.drawpoints();
		
		// Draw all symbols
		
}

// Recursive Pos of div in document - should work in most browsers
function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft
		curtop = obj.offsetTop
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
	}
	return {
				x:curleft,
				y:curtop
		}
}

function mousemoveevt(ev, t){
		mox=cx;
		moy=cy;
		
		if (ev.layerX||ev.layerX==0) { // Firefox
		    cx=ev.layerX-acanvas.offsetLeft;
		    cy=ev.layerY-acanvas.offsetTop;
		} else if (ev.offsetX || ev.offsetX == 0) { // Opera
		    cx=ev.offsetX-acanvas.offsetLeft;
		    cy=ev.offsetY-acanvas.offsetTop;
		}
			
		if(md==0){
				// Select a new point only if mouse is not already moving a point or selection box
				sel=points.distance(cx,cy);

				// If mouse is not pressed highlight closest point
				points.clearsel();	
				
				movobj=diagram.inside(cx,cy);

		}else if(md==1){
				// If mouse is pressed down and no point is close show selection box
		}else if(md==2){
				// If mouse is pressed down and a point is selected - move that point
				points[sel.ind].x=cx;
				points[sel.ind].y=cy;					
		}else if(md==3){
				// If mouse is pressed down inside a movable object - move that object
				if(movobj!=-1){
						diagram[movobj].move(cx-mox,cy-moy);
				}	
		}
		
		diagram.linedist(cx,cy);

		updategfx();		

		// Update quadrants -- This for-loop needs to be moved to a diragram method, just like updategfx or even inside updategfx
		for(i=0;i<diagram.length;i++){
				item=diagram[i];
				// Diagram item
				if(item.symbolkind==3){
						item.quadrants();
				}
				
		}
		
		// Draw select or create dotted box
		if(md==4){
				ctx.setLineDash([3, 3]);
				ctx.beginPath();
				ctx.moveTo(sx,sy);
				ctx.lineTo(cx,sy);
				ctx.lineTo(cx,cy);
				ctx.lineTo(sx,cy);
				ctx.lineTo(sx,sy);		
				ctx.stroke();
				ctx.setLineDash([]);
		}

} 

function mousedownevt(ev)
{
		if(sel.dist<10){
				md=2;				
		}else if(movobj!=-1){
				md=3;
		}else{
				md=4;			// Box select or Create mode.
				sx=cx;		
				sy=cy;
		}

}

function mouseupevt(ev)
{
		
		// Code for creating a new class
				
		if(md==4&&(uimode=="CreateClass"||uimode=="CreateERAttr")){
				// Add required points
				var p1=points.addpoint(sx,sy,false);
				var p2=points.addpoint(cx,cy,false);
				var p3=points.addpoint((cx+sx)*0.5,(cy+sy)*0.5,false);
		}

		if(uimode=="CreateClass"&&md==4){
				classB = new Symbol(1);
				classB.name="New"+diagram.length;		

				classB.operations.push({visibility:"-",text:"makemore()"});		
				classB.attributes.push({visibility:"+",text:"height:Integer"});
								
				classB.topLeft=p1;
				classB.bottomRight=p2;	
				classB.middleDivider=p3;	

				diagram.push(classB);
		}else if(uimode=="CreateERAttr"&&md==4){
				erAttributeA = new Symbol(2);
				erAttributeA.name="Attr"+diagram.length;		
				erAttributeA.topLeft=p1;
				erAttributeA.bottomRight=p2;	
				erAttributeA.centerpoint=p3;	
				diagram.push(erAttributeA);

		}

		updategfx();		

		// Clear mouse state
		md=0;

}

function classmode()
{
		uimode="CreateClass";
}

function attrmode()
{
		uimode="CreateERAttr";
}

function cross(xk,yk)
{
				ctx.strokeStyle="#4f6";
				ctx.lineWidth=3;
				ctx.beginPath();
				ctx.moveTo(xk-crossl,yk-crossl);
				ctx.lineTo(xk+crossl,yk+crossl);
				ctx.moveTo(xk+crossl,yk-crossl);
				ctx.lineTo(xk-crossl,yk+crossl);
				ctx.stroke();				
}

function drawOval(x1, y1, x2, y2) {
		xm = x1+((x2-x1)*0.5),       // x-middle
		ym = y1+((y2-y1)*0.5);       // y-middle
		
		ctx.beginPath();
		ctx.moveTo(x1, ym);
		ctx.quadraticCurveTo(x1,y1,xm,y1);
		ctx.quadraticCurveTo(x2,y1,x2,ym);
		ctx.quadraticCurveTo(x2,y2,xm,y2);
		ctx.quadraticCurveTo(x1,y2,x1,ym);
}   

var consloe={};
consloe.log=function(gobBluth)
{
		document.getElementById("consloe").innerHTML=((JSON.stringify(gobBluth)+"<br>")+document.getElementById("consloe").innerHTML);
} 

//----------------------------------------
// Renderer
//----------------------------------------

var momentexists=0;
var resave = false;
function returnedSection(data)
{
	retdata=data;
  if(data['debug']!="NONE!") alert(data['debug']);
		  
}
