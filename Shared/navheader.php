<header>
        <?php
            $requestedService = explode('?', $_SERVER['REQUEST_URI'], 2)[0];
            $requestedService = substr($requestedService,strrpos ( $requestedService , "/")+1);
			echo "<table class='navheader'><tr>";
			include_once "../Shared/basic.php";
			// As we always include the navheader - we can add the code that saves the current course ID to the session here.
			if(isset($_GET['courseid'])){
					$_SESSION['courseid']=$_GET['courseid'];
			}
			if(isset($_GET['coursevers'])){
					$_SESSION['coursevers']=$_GET['coursevers'];
			}
			// Always show home button which links to course homepage
			echo "<td class='navButt' id='home' title='Home'><a class='navButt' href='../DuggaSys/courseed.php'><img src='../Shared/icons/Home.svg'></a></td>";
			// Generate different back buttons depending on which page is including
			// this file navheader file. The switch case uses ternary operators to
			// determine the href attribute value. (if(this) ? dothis : elsethis)
			// If the current page is the course editor, don't display the back button
			//---------------------------------------------------------------------
			if($noup!='NONE') {
				  echo "<td class='navButt' id='back' title='Back'>";
			}
			if($noup=='COURSE'){
					echo "<a class='navButt' href='../DuggaSys/courseed.php'>";
					echo "<img src='../Shared/icons/Up.svg'></a></td>";
			}else if($noup=='SECTION'){
					$cid=getOPG('cid');
					if($cid=="UNK") $cid=getOPG('courseid');
					$coursevers=getOPG('coursevers');
					if($coursevers=="UNK") $coursevers=getOPG('cvers');
					echo "<a href='";
					echo ($cid != (string)"UNK" ? "../DuggaSys/sectioned.php?courseid=".$cid."&coursevers=".$coursevers : "../DuggaSys/courseed.php");
					echo "'>";
					echo "<img src='../Shared/icons/Up.svg'></a></td>";
            }

			// Either generate code viewer specific nav menu or a spacer
			if(isset($codeviewer)){
                echo "<td class='navButt' id='beforebutton' title='Previous example' onmousedown='Skip(\"bd\");' onmouseup='Skip(\"bu\");' onclick='Skip(\"b\");'><img src='../Shared/icons/backward_button.svg'></td>";
                echo "<td class='navButt' id='afterbutton' title='Next example' onmousedown='Skip(\"fd\");' onmouseup='Skip(\"fu\");' onclick='Skip(\"f\");'><img src='../Shared/icons/forward_button.svg' /></td>";
                echo "<td class='navButt' id='playbutton' title='Open demo' onclick='Play(event);'><img src='../Shared/icons/play_button.svg' /></td>";
                if(checklogin() && (isSuperUser($_SESSION['uid']) || hasAccess($_SESSION['uid'], $cid, 'st'))) {
                    echo "<td class='navButt' id='templatebutton' title='Choose Template' onclick='openTemplateWindow();'><img src='../Shared/icons/choose_template.svg'  /></td>";
                    echo "<td class='navButt' onclick='displayEditExample();' title='Example Settings' ><img src='../Shared/icons/general_settings_button.svg' /></td>";
                    echo "<td class='navButt' id='fileedButton' onclick='' style='display:none;' title='File Download/Upload' ><img src='../Shared/icons/general_upload_button.svg' /></td>";
                }
                echo "<td class='navButt' id='codeBurger' onclick='showBurgerMenu();' title='Show box' ><img src='../Shared/icons/hotdog_button.svg' /></td>";
                echo "<td class='navButt showmobile' style='display:none;'><a href='courseed.php'><img src='../Shared/icons/hotdog_button.svg'></a></td>";
                echo "<td id='navHeading' class='navHeading codeheader'>";
                echo "<span id='exampleSection'>Example Section : </span>";
                echo "<span id='exampleName'> Example Name</span>";
                echo "</td>";
            } else if(strcmp($requestedService,"accessed.php")===0 || strcmp($requestedService,"resulted.php")===0){
                echo "<td id='searchBar' class='navButt'>";
                // Chrome insists on autofilling search field with username. This is a workaround to void that error.
                echo   "<input id='curveball' type='text' style='display:none;' name='uname' placeholder='username'/>";
                echo   "<input id='curveball2' type='password' style='display:none;' name='pwd' placeholder='password'/>";
                // <--- end autofill workaround
                echo   "<input id='searchinput' type='text' name='search' placeholder='Search..' onkeyup='searchterm=this.value;myTable.reRender()'/>";
                echo   "<button id='searchbutton' class='switchContent' onclick='searchterm=document.getElementById(\"searchinput\").value;myTable.reRender()' type='button'>";
                echo     "<img id='lookingGlassSVG' style='height:18px;' src='../Shared/icons/LookingGlass.svg'/>";
                echo   "</button>";
                echo "</td>";
                if(strcmp($requestedService,"resulted.php")===0){
                    echo "<td class='tooltip-searchbar'>";
                    echo "<div class='tooltip-searchbar-box'>";
                    echo "<b>Keywords:</b> markG, markU, date <br> <b>Ex:</b> markG:färgdugga";
                    echo "</div><span>?</span></td>";    
                }
                echo "<td id='select' class='navButt'  onmouseover='hoverc();' onmouseleave='leavec();'>";
                echo   "<span>";
                echo     "<img class='navButt' src='../Shared/icons/tratt_white.svg'>";
                echo     "<div id='dropdownc' class='dropdown-list-container' style='z-index: 1'>";
                echo       "<div id='filterOptions'></div>";
                echo     "</div>";
                echo   "</span>";
                echo "</td>";
                echo "<td id='sort' class='navButt' onmouseover='hovers();' onmouseleave='leaves();'>";
                echo   "<span>";
                echo     "<img class='navButt' src='../Shared/icons/sort_white.svg'>";
                echo     "<div id='dropdowns' class='dropdown-list-container' style='z-index: 1'>";
                echo     "</div>";
                echo   "</span>";
                echo "</td>";
                echo "<td id='menuHook' class='navSpacer'>";
                echo "</td>";
            } else if(strcmp($requestedService,"fileed.php")===0){
                echo "<td id='searchBar' class='navButt'>";
                // Chrome insists on autofilling search field with username. This is a workaround to void that error.
                echo   "<input id='curveball' type='text' style='display:none;' name='uname' placeholder='username'/>";
                echo   "<input id='curveball2' type='password' style='display:none;' name='pwd' placeholder='password'/>";
                // <--- end autofill workaround
                echo   "<input id='searchinput' type='text' name='search' placeholder='Search..' onkeyup='searchterm=this.value;fileLink.reRender()'/>";
                echo   "<button id='searchbutton' class='switchContent' onclick='searchterm=document.getElementById(\"searchinput\").value;fileLink.reRender()' type='button'>";
                echo     "<img id='lookingGlassSVG' style='height:18px;' src='../Shared/icons/LookingGlass.svg'/>";
                echo   "</button>";
                echo "</td>";
                echo "<td id='menuHook' class='navSpacer'>";
                echo "</td>";
            } else{
                echo "<td id='select' style='display:none;' class='navButt'  onmouseover='hoverc();' onmouseleave='leavec();'>";
                echo   "<span>";
                echo     "<img class='navButt' src='../Shared/icons/tratt_white.svg'>";
                echo     "<div id='dropdownc' class='dropdown-list-container' style='z-index: 1'>";
                echo     "<div id='filterOptions'></div>";
                echo     "</div>";
                echo   "</span>";
                echo "</td>";
                echo "<td id='sort' style='display:none' class='navButt' onmouseover='hovers();' onmouseleave='leaves();'>";
                echo   "<span>";
                echo     "<img class='navButt' src='../Shared/icons/sort_white.svg'>";
                echo     "<div id='dropdowns' class='dropdown-list-container' style='z-index: 1'>";
                echo     "</div>";
                echo   "</span>";
                echo "</td>";
                echo "</td>";
                echo "<td id='menuHook' class='navSpacer'>";
            }
            if(checklogin()) {
                echo "<td class='navName'><a id='userName' href='profile.php' title='".$_SESSION['loginname']."&#39;s profile'>".$_SESSION['loginname']."</a></td>";
                echo "<td id='loginbutton' class='loggedin'><img id='loginbuttonIcon' src='../Shared/icons/logout_button.svg' title='Logout'/></td>";
            }else{
                echo "<td class='navName'><label id='userName' title='Login to view your profile'>Guest</label></td>";
                echo "<td id='loginbutton' class='loggedout'><img id='loginbuttonIcon' src='../Shared/icons/login_button.svg' title='Login'/></td>";
            }
			// if(checklogin()) {
			// 		echo "<td class='navName'><a id='userName' href='profile.php' title='".$_SESSION['loginname']."&#39;s profile'>".$_SESSION['loginname']."</a></td>";
			// 		echo "<td id='loginbutton' class='loggedin'><img id='loginbuttonIcon' onload='loginButtonHover(\"online\")' src='../Shared/icons/Man.svg' title='Logout'/></td>";
			// }else{
			// 		echo "<td class='navName'><label id='userName' title='Login to view your profile'>Guest</label></td>";
			// 		echo "<td id='loginbutton' class='loggedout'><img id='loginbuttonIcon' onload='loginButtonHover(\"offline\")' src='../Shared/icons/Man.svg' title='Login'/></td>";
			// }
		    echo "</tr></table>";
		    if(isset($codeviewer)){
			    echo "<div id='mobileNavHeading'><span id='mobileExampleSection'></span><span id='mobileExampleName'></span></div>";
		    }
		    //Cookie message
		    echo "<div id='cookiemsg' class='alertmsg'><p>This site uses cookies. By continuing to browse this page you accept the use of cookies.</p><input type='button' value='OK' class='submit-button' onclick='cookieMessage()'/></div>";
	    ?>
</header>
<script type="text/javascript">
		if(localStorage.getItem("cookieMessage")=="off"){
			$("#cookiemsg").css("display", "none");
		}else{
			$("#cookiemsg").css("display", "flex");
		}
	setupLoginLogoutButton('<?PHP echo json_encode(checklogin()) ?>');
	function cookieMessage(){
		hideCookieMessage();
		localStorage.setItem("cookieMessage", "off");
		//$("#cookiemsg").css("display", "none");
	}
	function hoverBack(){
		$(".dropdown-list-container").css("display", "none");
	}
</script>
<script type="text/javascript">
	(function(proxied) {
		window.alert = function() {
			return <?php echo checkLogin() && isSuperUser($_SESSION['uid']) ? "proxied.apply(this, arguments)" : "null" ?>;
		};
	})(window.alert);
</script>