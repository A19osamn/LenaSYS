<?php

if(empty($_FILES['file'])){

	header('Content-type: text/plain');
	echo "No file selected, try again";
	return;

}
//H�mtar namnet p� den bilden som f�rs�ks flyttas ($file_temp) och h�mtar den nya platsen f�r bilden.
$file_temp = $_FILES["file"]["tmp_name"];
$newloc = "template/" . $_FILES["file"]["name"];

//Flyttar filen ($file) till den nya platsen ($newloc)
move_uploaded_file($file_temp, $newloc);

	header('Location: index.php'); 



?>