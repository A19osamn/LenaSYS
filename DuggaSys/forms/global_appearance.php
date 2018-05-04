Font family:<br>
<select id='font' onclick='globalFont(); hashfunction(); updategfx();'>
    <option value='Arial' selected>Arial</option>
    <option value='Courier New'>Courier New</option>
    <option value='Impact'>Impact</option>
    <option value='Calibri'>Calibri</option>
</select><br>

Font color:<br>
<select id ='fontColor' onclick='globalFontColor(); hashfunction(); updategfx();'>
    <option value='#ccefff'>Blue</option>
    <option value='#ddffee'>Green</option>
    <option value='#e6e6e6'>Grey</option>
    <option value='#ff9999'>Red</option>
    <option value='#ffffcc'>Yellow</option>
    <option value='#ffe0cc'>Orange</option>
    <option value='#ffccff'>Purple</option>
    <option value='#ffffff'>White</option>
    <option value='#000000'>Black</option>
</select><br>
Text size:<br>
<select id='TextSize' onclick='globalTextSize(); hashfunction(); updategfx();'>
    <option value='Tiny' selected>Tiny</option>
    <option value='Small'>Small</option>
    <option value='Medium'>Medium</option>
    <option value='Large'>Large</option>
</select><br>
Fill color:<br>
<select onclick="globalFillColor(); hashfunction(); updategfx();" id='FillColor'>
    <option value='#ccefff'>Blue</option>
    <option value='#ddffee'>Green</option>
    <option value='#e6e6e6'>Grey</option>
    <option value='#ff9999'>Red</option>
    <option value='#ffffcc'>Yellow</option>
    <option value='#ffe0cc'>Orange</option>
    <option value='#ffccff'>Purple</option>
    <option value='#ffffff'>White</option>
    <option value='#000000'>Black</option>
</select><br>
Stroke color:<br>
<select onclick="globalStrokeColor(); hashfunction(); updategfx();" id='StrokeColor'>
    <option value='#ccefff'>Blue</option>
    <option value='#ddffee'>Green</option>
    <option value='#e6e6e6'>Grey</option>
    <option value='#ff9999'>Red</option>
    <option value='#ffffcc'>Yellow</option>
    <option value='#ffe0cc'>Orange</option>
    <option value='#ffccff'>Purple</option>
    <option value='#ffffff'>White</option>
    <option value='#000000'>Black</option>
</select><br>
Line thickness:<br>
<input id="line-thickness" onclick='globalLineThickness(); hashfunction(); updategfx();' style="width:100%; margin: -2px; padding: 0px;" type="range" min="1" max="5" value="2">

<button type='submit' class='submit-button' onclick="closeAppearanceDialogMenu(); changeObjectAppearance(); setType(form);" style='float: none; display: block; margin: 0px auto;'>OK</button>
