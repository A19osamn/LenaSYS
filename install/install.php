<head>
    <title>Install LenaSYS!</title>
    <link rel="stylesheet" type="text/css" href="CSS/install_style.css">
    <script src="../Shared/js/jquery-1.11.0.min.js"></script>
    <script src="../Shared/js/jquery-ui-1.10.4.min.js"></script>
</head>
<body>
    <?php
    $errors = 0;
    // Create a version of dirname for <PHP7 compability
    function cdirname($path, $level) {
      $paths = explode("/", $path);
      $r = '';
      if(count($paths) <= $level) {
        $r = '/';
      } else {
        $r = '/';
        for($i = 0; $i < count($paths) - $level; $i++) {
          if($i > 1) {
            $r .= '/';
          }
          $r .= $paths[$i];
        }
      }
      return $r;
    };

    ob_start();
    /************* MODAL TO SHOW STEPS BEFORE AND AFTER ****************/
 
    $putFileHere = cdirname(getcwd(), 1); // Path to lenasys
    echo "
                    <div id='warning' class='modal'>
                
                        <!-- Modal content -->
                        <div class='modal-content'>
                            <span class='close''>&times;</span>
                                <span id='dialogText'></span>
                        </div>
                
                    </div>";
    ?>

    <script>
        var modalRead = false; // Have the user read info?
        var modal = document.getElementById('warning'); // Get the modal
        var span = document.getElementsByClassName("close")[0]; // Get the button that opens the modal
        var filePath = "<?php echo $putFileHere; ?>";

        document.getElementById('dialogText').innerHTML="<div style='background-image: url(../Shared/icons/warningTriangle.png); background-size: 10%; background-repeat: no-repeat;'><h1 style='text-align: center;'><span style='color: red;' />" +
            "!!!!!!READ THIS BEFORE YOU START!!!!!!</span></h1><br>" +
            "<h2 style='text-align: center;'>Make sure you set ownership of LenaSYS directory to 'www-data'.<br>" +
            "<br>" +
            "To do this run the command:<br>" +
            "sudo chgrp -R www-data " + filePath + "</h2><br>" +
            "<br>" +
            "<input onclick='if(this.checked){haveRead(true)}else{haveRead(false)}' class='startCheckbox' type='checkbox' value='1'>" +
            "<i>I promise i have done this and will not complain that it's not working</i></div>";

        function haveRead(isTrue) {
            modalRead = isTrue;
        }

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            if (modalRead) {
                modal.style.display = "none";
            }
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal && modalRead) {
                modal.style.display = "none";
            }
        }
    </script>

    <div id="header">
        <h1>LenaSYS Installer</h1>
        <span id="showModalBtn"><b>Open start-dialog again.</b><br> (To see what permissions to set)</span>
    </div>
    <script>
        var btn = document.getElementById("showModalBtn"); // Get the button that opens the modal
        // Open modal on button click
        btn.onclick = function () {
        modal.style.display = "block";
        }
    </script>
    <form action="install.php?mode=install" method="post">
        <div id="inputWrapper">
            <div class="inputHeading" valign=top style="display:block;">
                <div id="th1" style="display: block; height:50px;"><h2>New/Existing MySQL user and DB</h2></div>
                <div id="th2" style="display: none; height:50px;"><h2>MySQL Root Login</h2></div>
                <div id="th3" style="display: none; height:50px;"><h2>Test Data</h2></div>
                <div id="th4" style="display: none; height:50px;"><h2>Write over?</h2></div>
                <div id="th5" style="display: none; height:50px;"><h2>Submit</h2></div>
            </div>
 <?php
    // Prefill existing credentials, exluding password
    $dbUsername = "";
    $dbHostname = "";
    $dbName = "";

    $credentialsFile = "../../coursesyspw.php";
    if(file_exists("../../coursesyspw.php")) {
      $credentialsArray = file($credentialsFile, FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES);

      // check if the credentials exists in the file, store them if they do
      foreach($credentialsArray as $cred) {
        if(stripos(trim($cred), 'DB_') !== FALSE){
          $tArray = explode('"', trim($cred));
          if(count($tArray) == 5) {
            if($tArray[1]=="DB_USER"){
              $dbUsername = $tArray[3];
            }else if($tArray[1]=="DB_HOST"){
              $dbHostname = $tArray[3];
            }else if($tArray[1]=="DB_NAME"){
              $dbName = $tArray[3];
            }
          }
        }
      }
    }
    echo '<div id="contentWrapper" style="height:400px">';
    echo '<div class="inputContent" id="td1" style="display:block;">';
    echo '<p id="infoText"><b>To start installation please enter a new (or existing) MySQL user. This could, for example, be your student login.
            Next enter a password for this user (new or existing).<br>
            After this enter a database to use. This could also be either an existing or a new database.<br>
            Finally enter the host. Is installation is running from webserver localhost should be used.</b></p><hr>';
    echo 'Enter new MySQL user. <br>';
    echo '<input type="text" name="newUser" placeholder="Username" value="'.$dbUsername.'" /> <br>';
    echo 'Enter password for MySQL user. <br>';
    echo '<input type="password" name="password" placeholder="Password" /> <br>';
    echo 'Enter new database name. <br>';
    echo '<input type="text" name="DBName" placeholder="Database name" value="'.$dbName.'" /> <br>';
    echo 'Enter hostname (e.g localhost). <br>';
    echo '<input type="text" name="hostname" placeholder="Hostname" value="'.$dbHostname.'" /> <br>';
    echo '</div>';
?>
                <div class="inputContent" id="td2" valign=top style="display:none;">
                    <p id="infoText"><b>Enter root log-in credentials for the database you want to use.<br>
                        Default user has name 'root'. If password for root user is unknown ask a teacher or someone who knows.</b></p><hr>
                    Enter MySQL root user. <br>
                    <input type="text" name="mysqlRoot" placeholder="Root" value="root"/> <br>
                    Enter password for MySQL root user. <br>
                    <input type="password" name="rootPwd" placeholder="Root Password" /> <br>
                </div>
                <div class="inputContent" id="td3" valign=top style="display:none;">
                    <p id="infoText"><b>If you wish to create a new, empty database check the box 'Create new database'. If you want to fill this
                        database with testdata (located in install/SQL/testdata.sql) you should check the box for this too. If you
                        are using an existing database and wishes to re-write it you will be able to make this choice on the next page.</b></p><hr>
                    <input type="checkbox" name="createDB" value="Yes" checked/>
                    Create new database. <br><hr>
                    <input type="checkbox" name="fillDB" value="Yes" checked/>
                    Include test data. <br><br>
                    <b>Language keyword highlighting support.<br></b>
                    <i>Choose which languages you wish to support in codeviewer. (You need to check 'Include test data' to be able to include these.</i><br>
                    <div id="checkboxContainer" style="text-align: left">
                        <input type="checkbox" name="html" value="Yes" checked/> HTML <br>
                        <input type="checkbox" name="java" value="Yes" checked/> Java <br>
                        <input type="checkbox" name="php" value="Yes" checked/> PHP <br>
                        <input type="checkbox" name="plain" value="Yes" checked/> Plain Text <br>
                        <input type="checkbox" name="sql" value="Yes" checked/> SQL <br>
                        <input type="checkbox" name="sr" value="Yes" checked/> SR <br>
                    </div>
                </div>
                <div class="inputContent" id="td4" colspan="3" bgcolor="#FFCCCC" style="display:none;">
                    <p id="infoText"><b>If you have entered a user and/or database that already exists you must check the checkboxes below to accept overwriting these.
                        <br>If you only entered an existing user but a new database only check the box for user overwrite.
                        <br>If you only entered an existing database for a new user only check the box for database overwrite.
                        <br>If both are existing both boxes should be checked.
                        <br>If it's a completely new database and user no box has to be checked.</b></p><hr>
                    <input type="checkbox" name="writeOverDB" value="Yes" />
                    Yes I want to write over an existing database.<br>
                    <input type="checkbox" name="writeOverUSR" value="Yes" />
                    Yes I want to write over an existing user.<br>
                        <span style='color: red;'>(WARNING: THIS WILL REMOVE ALL DATA IN PREVIOUS DATABASE AND/OR USER)</span></b><br>
                </div>
                <div class="inputContent" id="td5" bgcolor="#EEEEEE" style="display:none">
                    <p id="infoText"><b>If all fields are filled out correctly the only thing remaining is to smack the 'Install' button below.
                        Progress of installation will be shown. If any errors occurs please try again and check that your data is correct.
                        If you still get errors please read installation guidelines on LenaSYS github page or in 'README.md'. </b></p><hr>
                    <input class="button" type="submit" name="submitButton" value="Install!" onclick="resetWindow()"/>
                </div>
            </div>
            <div class="arrow" id="leftArrow" style="display:none">
                <svg height="150" width="150">
                    <circle cx="75" cy="75" r="70" fill="rgb(253,203,96)" />
                    <polygon points="100,30 20,75 100,120" style="fill:rgb(255,233,126);" />
                </svg>
            </div>
            <div class="arrow" id="rightArrow">
                <svg height="150" width="150">
                    <circle cx="75" cy="75" r="70" fill="rgb(253,203,96)" />
                    <polygon points="50,30 130,75 50,120" style="fill:rgb(255,233,126);" />
                </svg>
            </div>
            <script>
                var leftArrow = document.getElementById('leftArrow');
                var rightArrow = document.getElementById('rightArrow');
                var inputPage = 1;
                var previousInputPage = 0;

                leftArrow.onclick = function() {
                    previousInputPage = inputPage;
                    if(inputPage > 1) inputPage--;
                    updateInputPage();
                }

                rightArrow.onclick = function() {
                    previousInputPage = inputPage;
                    if (inputPage < 5) inputPage++;
                    updateInputPage();
                }

                function updateInputPage(){
                    hideInputPage();

                    if (inputPage == 1) {
                        document.getElementById('leftArrow').style.display = "none";
                    } else {
                        document.getElementById('leftArrow').style.display = "block";
                    }
                    if (inputPage == 5) {
                        document.getElementById('rightArrow').style.display = "none";
                    } else {
                        document.getElementById('rightArrow').style.display = "block";
                    }
                }

                function hideInputPage(){
                    if (inputPage > previousInputPage) {
                        $('#th' + previousInputPage).hide("slide", {direction: "left" }, 500);
                        $('#td' + previousInputPage).hide("slide", {direction: "left" }, 500);
                    } else {
                        $('#th' + previousInputPage).hide("slide", {direction: "right" }, 500);
                        $('#td' + previousInputPage).hide("slide", {direction: "right" }, 500);
                    }
                    window.setTimeout(showInputPage,500);
                }

                function showInputPage(){
                    if (inputPage > previousInputPage) {
                        $('#th' + inputPage).show("slide", {direction: "right" }, 500);
                        $('#td' + inputPage).show("slide", {direction: "right" }, 500);
                    } else {
                        $('#th' + inputPage).show("slide", {direction: "left" }, 500);
                        $('#td' + inputPage).show("slide", {direction: "left" }, 500);
                    }
                }
            </script>
            <div id="inputFooter"></div>
        </div>
    </form>

    <?php if (isset($_GET["mode"]) && $_GET["mode"] == "install") {
        $putFileHere = cdirname(getcwd(), 2); // Path to lenasys
        ob_end_clean(); // Remove form and start installation.

        echo "
                    <div id='warning' class='modal'>
                
                        <!-- Modal content -->
                        <div class='modal-content'>
                            <span class='close''>&times;</span>
                                <span id='dialogText'></span>
                        </div>
                
                    </div>";
        echo "
            <script>
                var modalRead = false; // Have the user read info?
                var modal = document.getElementById('warning'); // Get the modal
                var btn = document.getElementById('showModalBtn'); // Get the button that opens the modal
                var span = document.getElementsByClassName('close')[0]; // Get the button that opens the modal
                var filePath = '{$putFileHere}';
                
                document.getElementById('dialogText').innerHTML = '<div style=\'background-image: url(../Shared/icons/warningTriangle.png); background-size: 150px; background-repeat: no-repeat;\'><h1 style=\'text-align: center;\'><span style=\'color: red;\' />!!!WARNING!!!</span></h1><br>' +
                    '<h2 style=\'text-align: center;\'>READ INSTRUCTIONS UNDER INSTALL PROGRESS.</h2>' +
                    '<p style=\'text-align: center;\'>If you don\'t follow these instructions nothing will work. Group 3 will not take any ' +
                    'responsibility for your failing system.</p>';
                
                // When the user clicks on <span> (x), close the modal
                span.onclick = function() {
                    modal.style.display = 'none';
                }

                // When the user clicks anywhere outside of the modal, close it
                window.onclick = function(event) {
                    if (event.target == modal) {
                        modal.style.display = 'none';
                    }
                }
            </script>
        ";
        flush();
        ob_flush();

        /***** START ******/
        $putFileHere = cdirname(getcwd(), 1); // Path to lenasys
        echo "<div id='header'><h1>Installation</h1></div>";
        flush();
        ob_flush();

        echo "<div id='installationProgressWrap'>";
        # Test permissions on directory before starting installation.
        if(!mkdir("{$putFileHere}/testPermissionsForInstallationToStartDir", 0777)) {
            $errors++;
            exit ("<span style='color: red;' />Permissions on {$putFileHere} not set correctly, please restart the installation.</span>");
        } else {
            if (!rmdir("{$putFileHere}/testPermissionsForInstallationToStartDir")) {
                $errors++;
                exit ("<span style='color: red;' />Permissions on {$putFileHere} not set correctly, please restart the installation.</span>");
            } else {
                echo "<span style='color: green;' />Permissions on {$putFileHere} set correctly.</span><br>";
            }
        }

        # Check if all fields are filled.
        $fields = array("newUser", "password", "DBName", "hostname", "mysqlRoot", "rootPwd");
        foreach ($fields AS $fieldname) { //Loop trough each field
            if (!isset($_POST[$fieldname]) || empty($_POST[$fieldname])) {
                $errors++;
                exit ("<span style='color: red;' />Please fill all fields.</span>");
            }
        }

        # Only create DB if box is ticked.
        if (isset($_POST["createDB"]) && $_POST["createDB"] == 'Yes') {

            $username = $_POST["newUser"];
            $password = $_POST["password"];
            $databaseName = $_POST["DBName"];
            $serverName = $_POST["hostname"];

            $rootUser = $_POST["mysqlRoot"];
            $rootPwd = $_POST["rootPwd"];

            # Connect to database with root access.
            try {
                $connection = new PDO("mysql:host=$serverName", $rootUser, $rootPwd);
                // set the PDO error mode to exception
                $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                echo "<span style='color: green;' />Connected successfully to {$serverName}.</span><br>";
            } catch (PDOException $e) {
                $errors++;
                echo "<span style='color: red;' />Connection failed: " . $e->getMessage() . "</span><br>";
            }
            flush();
            ob_flush();

            # If checked, write over existing database and user
            if (isset($_POST["writeOverUSR"]) && $_POST["writeOverUSR"] == 'Yes') {
                # User
                try {
                $connection->query("DELETE FROM mysql.user WHERE user='{$username}';");
                echo "<span style='color: green;' />Successfully removed old user, {$username}.</span><br>";
                } catch (PDOException $e) {
                $errors++;
                echo "<span style='color: red;' />User with name {$username} 
                            does not already exist. Will only make a new one (not write over).</span><br>";
                }
                flush();
                ob_flush();
            }
            if (isset($_POST["writeOverDB"]) && $_POST["writeOverDB"] == 'Yes') {
                # Database
                try {
                    $connection->query("DROP DATABASE {$databaseName}");
                    echo "<span style='color: green;' />Successfully removed old database, {$databaseName}.</span><br>";
                } catch (PDOException $e) {
                    $errors++;
                    echo "<span style='color: red;' />Database with name {$databaseName} 
                            does not already exist. Will only make a new one (not write over).</span><br>";
                }
                flush();
                ob_flush();
            }

            # Create new database
            try {
                $connection->query("CREATE DATABASE {$databaseName}");
                echo "<span style='color: green;' />Database with name {$databaseName} created successfully.</span><br>";
            } catch (PDOException $e) {
                $errors++;
                echo "<span style='color: red;' />Database with name {$databaseName} could not be created. Maybe it already exists...</span><br>";
            }
            flush();
            ob_flush();

            # Create new user and grant privileges to created database.
            try {
                $connection->query("FLUSH PRIVILEGES");
                $connection->query("CREATE USER '{$username}'@'{$serverName}' IDENTIFIED BY '{$password}'");
                $connection->query("GRANT ALL PRIVILEGES ON *.* TO '{$username}'@'{$serverName}'");
                $connection->query("FLUSH PRIVILEGES");
                echo "<span style='color: green;' />Successfully created user {$username}.</span><br>";
            } catch (PDOException $e) {
                $errors++;
                echo "<span style='color: red;' />Could not create user with name {$username}, maybe it already exists...</span><br>";
            }
            flush();
            ob_flush();

            /**************************** Init database. *************************************/
            $initQuery = file_get_contents("SQL/init_db.sql");

            # This loop will find comments in the sql file and remove these.
            # Comments are removed because some comments included semi-colons which wont work.
            while(true) {
                $startPos = strpos($initQuery, "/*");
                $endPos = strpos($initQuery, "*/");
                if ($startPos === false || $endPos === false) {
                    break;
                }
                $removeThisText = substr($initQuery, $startPos, ($endPos + 2) - $startPos);
                $initQuery = str_replace($removeThisText, '', $initQuery);
            }

            # Split the sql file at semi-colons to send each query separated.
            $initQueryArray = explode(";", $initQuery);
            $initSuccess = false;
            try {
                $connection->query("SET NAMES utf8");
                $connection->query("USE {$databaseName}");
                # Use this var if several statements should be called at once (functions).
                $queryBlock = '';
                $blockStarted = false;
                foreach ($initQueryArray AS $query) {
                    $completeQuery = $query . ";";

                    # This commented code in this block could work if delimiters are fixed/removed in sql files.
                    # TODO: Fix handling of delimiters. Now this part only removes code between them.
                    if (!$blockStarted && strpos(strtolower($completeQuery), "delimiter //")) {
                        $blockStarted = true;
                        #$queryBlock = $completeQuery;
                    } else if ($blockStarted && strpos(strtolower($completeQuery), "delimiter ;")) {
                        $blockStarted = false;
                        #$queryBlock = $queryBlock . $completeQuery;
                        #$connection->query($queryBlock);
                    } else if ($blockStarted) {
                        #$queryBlock = $queryBlock . $completeQuery;
                    } else {
                        if (trim($query) != '') { // do not send if empty query.
                            $connection->query($completeQuery);
                        }
                    }
                }
                $initSuccess = true;
                echo "<span style='color: green;' />Initialization of database complete. </span><br>";
            } catch (PDOException $e) {
                $errors++;
                echo "<span style='color: red;' />Failed initialization of database because of query (in init_db.sql): </span><br>";
                echo "<div style='word-wrap: break-word; background-color: #cccccc; min-width: 300px; max-width: 80%; height: *; margin: 0:auto; padding: 5px; border-style: solid; border-width: 2px;'><code>{$completeQuery}</code></div><br><br>";
            }
            flush();
            ob_flush();

            /*************** Fill database with test data if this was checked. ****************/
            if (isset($_POST["fillDB"]) && $_POST["fillDB"] == 'Yes' && $initSuccess) {
                addTestData("testdata", $connection);

                # Check which languages to add from checkboxes.
                $checkBoxes = array("html", "java", "php", "plain", "sql", "sr");
                foreach ($checkBoxes AS $boxName) { //Loop trough each field
                    if (!isset($_POST[$boxName]) || empty($_POST[$boxName])) {
                        echo "Skipped keywords for {$boxName}. <br>";
                    } else {
                        if ($_POST[$boxName] == 'Yes') {
                            addTestData("keywords_{$boxName}", $connection);
                        }
                    }
                }

                /************* Copy test code files to the right place *****************/
                if(@!mkdir("{$putFileHere}/courses", 0770, true)){
                    echo "Did not create courses directory, it already exists.<br>";
                } else {
                    echo "<span style='color: green;' />Created the directory '{$putFileHere}/courses'.</span><br>";
                }
                copyTestFiles("{$putFileHere}/install/courses/global/", "{$putFileHere}/courses/1/");

            } else {
                echo "Skipped filling database with test data.<br>";
            }

        } else {
            echo "Skipped creating database.<br>";
        }

        echo "<b>Installation finished.</b><br>";
        flush();
        ob_flush();
        echo "</div>";
        echo "<div id='inputFooter'><span id='showHideInstallation'>Show/hide installation progress.</span><br>
                <span style='color: white;font-size:24px;'>Errors: " . $errors . "</span></div>";

        # All this code prints further instructions to complete installation.
        $putFileHere = cdirname(getcwd(), 2); // Path to lenasys
        echo "<div id='doThisWrapper'>";
        echo "<h1><span id='warningH1' />!!!READ BELOW!!!</span></h1>";
        echo "<br><b>To make installation work please make a
            file named 'coursesyspw.php' at {$putFileHere} with some code.</b><br>";

        echo "<b>Bash command to complete all this (Copy all code below/just click the box and paste it into bash shell as one statement):</b><br>";
        echo "<div class='codeBox' onclick='selectText(\"codeBox1\")'><code id='codeBox1'>";
        echo 'sudo printf "' . htmlspecialchars("<?php") . '\n';
        echo 'define(\"DB_USER\",\"' . $username . '\");\n';
        echo 'define(\"DB_PASSWORD\",\"' . $password . '\");\n';
        echo 'define(\"DB_HOST\",\"' . $serverName . '\");\n';
        echo 'define(\"DB_NAME\",\"' . $databaseName . '\");\n';
        echo htmlspecialchars("?>") . '" > ' . $putFileHere . '/coursesyspw.php';
        echo "</code></div>";

        echo '<div id="copied1" style="display:none">Copied to clipboard!<br></div>';

        echo "<br><b> Now create a directory named 'log' (if you dont already have it)<br> 
                with a sqlite database inside at " . $putFileHere . " with permissions 777<br>
                (Copy all code below/just click the box and paste it into bash shell as one statement to do this).</b><br>";
        echo "<div class='codeBox' onclick='selectText(\"codeBox2\")'><code id='codeBox2'>";
        echo "mkdir " . $putFileHere . "/log && ";
        echo "chmod 777 " . $putFileHere . "/log && ";
        echo "sqlite3 " . $putFileHere . '/log/loglena4.db "" && ';
        echo "chmod 777 " . $putFileHere . "/log/loglena4.db";
        echo "</code></div>";
        echo '<div id="copied2" style="display:none">Copied to clipboard!<br></div>';

        $lenaInstall = cdirname($_SERVER['SCRIPT_NAME'], 2);
        echo "<form action=\"{$lenaInstall}/DuggaSys/courseed.php\">";
        echo "<br><input class='button2' type=\"submit\" value=\"I have made all the necessary things to make it work, so just take me to LenaSYS!\" />";
        echo "</form>";
        echo "</div>";
    }

    # Function to add testdata from specified file. Parameter file = sql file name without .sql.
    function addTestData($file, $connection){
        global $errors;
        $testDataQuery = @file_get_contents("SQL/{$file}.sql");

        if ($testDataQuery === FALSE) {
            $errors++;
            echo "<span style='color: red;' />Could not find SQL/{$file}.sql, skipped this test data.</span><br>";
        } else {
            # Split SQL file at semi-colons to send each query separated.
            $testDataQueryArray = explode(";", $testDataQuery);
            try {
                foreach ($testDataQueryArray AS $query) {
                    $completeQuery = $query . ";"; // Add semi-colon to each query.
                    if (trim($query) != '') { // do not send if empty query.
                        $connection->query($completeQuery);
                    }
                }
                echo "<span style='color: green;' />Successfully filled database with test data from {$file}.sql.</span><br>";
            } catch (PDOException $e) {
                $errors++;
                echo "<span style='color: red;' />Failed to fill database with data because of query in {$file}.sql (Skipped the rest of this file):</span><br>";
                echo "<div style='word-wrap: break-word; background-color: #cccccc; min-width: 300px; max-width: 80%; height: *; margin: 0:auto; padding: 5px; border-style: solid; border-width: 2px;'><code>{$completeQuery}</code></div><br><br>";
            }
        }
        flush();
        ob_flush();
    }

    # Function to copy test files
    function copyTestFiles($fromDir,$destDir) {
        $dir = opendir($fromDir);
        @mkdir($destDir);
        while (false !== ($copyThis = readdir($dir))) {
            if (($copyThis != '.') && ($copyThis != '..')) {
                copy($fromDir . '/' . $copyThis, $destDir . '/' . $copyThis);
            }
        }
        closedir($dir);
        echo "<span style='color: green;' />Successfully filled {$destDir} with example files.</span><br>";
    }
    ?>

    <script>
        // Show modal
        modal.style.display = "block";
        var showHideButton = document.getElementById('showHideInstallation');

        showHideButton.onclick = function(){
            toggleInstallationProgress();
        }

        function toggleInstallationProgress(){
            $('#installationProgressWrap').toggle(500);
        }

        function selectText(containerid) {
            if (document.selection) {
                var range = document.body.createTextRange();
                range.moveToElementText(document.getElementById(containerid));
                range.select();
            } else if (window.getSelection) {
                var range = document.createRange();
                range.selectNode(document.getElementById(containerid));
                window.getSelection().addRange(range);
            }

            document.execCommand("copy");
            window.getSelection().removeAllRanges();

            if (containerid == "codeBox1") {
                $("#copied1").show("slide", {direction: "left" }, 1000);
                window.setTimeout(function() { hideCopiedAgain("#copied1")}, 2000);
            } else if (containerid == "codeBox2") {
                $("#copied2").show("slide", {direction: "left" }, 1000);
                window.setTimeout(function() { hideCopiedAgain("#copied2")}, 2000);
            }
        }

        function hideCopiedAgain(text){
            $(text).hide("slide", {direction: "right" }, 1000)
        }

        toggleInstallationProgress();
    </script>

</body>
