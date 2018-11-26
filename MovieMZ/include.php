<?php
#注册插件
// require 'ParserDom.php';
RegisterPlugin("MovieMZ", "ActivePlugin_MovieMZ");
function ActivePlugin_MovieMZ()
{
  Add_Filter_Plugin('Filter_Plugin_Cmd_Ajax', 'MovieMZ_Ajax');
  Add_Filter_Plugin('Filter_Plugin_Edit_Begin', 'MovieMZ_SetHint');
  // Add_Filter_Plugin('Filter_Plugin_Edit_Response3', 'MovieMZ_Main');
  Add_Filter_Plugin('Filter_Plugin_Edit_Response2', 'MovieMZ_txt');
}
function MovieMZ_SetHint()
{
  global $zbp;
  $plugin = MovieMZ_Path("plugin", "host");
  echo '<meta name="MovieMZ-Token" content="' . MovieMZ_Token(59) . '" />';
  echo <<<jj
<script src="{$plugin}" type="text/javascript"></script>
jj;
  $files = GetFilesInDir(MovieMZ_Path("cache"), "txt");
  $logs = GetFilesInDir(MovieMZ_Path("cache"), "log");
  if (count($logs) > 0) {
    $zbp->SetHint("tips", '电影信息生成：鉴权错误，请重新部署脚本或忽略本提示<a href="' . MovieMZ_Path("main", "host") . '">点击处理</a>');
    @unlink(reset($logs));
  }
  if (count($files) > 0)
    $zbp->SetHint("tips", '电影信息生成：有未处理的抓取信息<a href="javascript:;" onclick="MovieMZ_Slide()">点击查看</a>');
}
// function MovieMZ_Main()
// {


// }

function MovieMZ_txt()
{
  echo <<<html
<div class="content-box ui-draggable" id="MovieMZ-Wraper" style="display: none;position: absolute;">
  <ul class="content-box-tabs">
    <li><a href="#MovieMZ-Box" class="default-tab current">缓存列表</a></li>
    <li><a href="#tab2" class="tab2">插入下载</a></li>
  </ul>
  <div style="clear: both;"></div>
  <div class="content-box-content">
    <div class="tab-content default-tab" id="MovieMZ-Box">
      Loading
    </div>
    <div class="tab-content" style="text-align: center;" id="tab2">
      <hr />
      <textarea spellcheck="false" style="width: 98%;" name="mmz-text" id="mmz-text" cols="30" rows="10"></textarea>
      <p style="text-align: center;">目前只支持ed2k <br> <input class="button mmz-input" value="解析并插入" type="button" /><input class="button" onclick="$('#MovieMZ-Wraper').fadeOut();return false;" value="关闭" type="button" /></p>
    </div>
  </div>
</div>

html;
}
function MovieMZ_Ajax($src)
{
  global $zbp;
  $token = GetVars('token', 'GET');
  if ($src !== "MovieMZ")
    return;
  if (!$zbp->CheckRights("root") || !VerifyWebToken($token, "MovieMZ")) {
    file_put_contents(MovieMZ_Path("cache") . date("Ymd") . "_err.log", "");
    return;
  }
  if ($str = file_get_contents('php://input')) {
    $obj = json_decode($str);
    if (is_object($obj) && isset($obj->id)) {
      file_put_contents(MovieMZ_Path("cache") . "{$obj->id}.txt", $str);
      JsonReturn((object)array("id" => $obj->id));
    }
    die();
  } else if ($ID = GetVars("id", "GET")) {
    $file = MovieMZ_Path("cache/{$ID}.txt");
    @unlink($file);
    JsonReturn((object)array());
  } else {
    $files = GetFilesInDir(MovieMZ_Path("cache"), "txt");
    $array = array();
    foreach ($files as $id => $file) {
      $obj = json_decode(file_get_contents($file));
      $obj->time = date("Ymd H:i", filemtime($file));
      $array[$id] = $obj;
    }
    JsonReturn($array);
    die();
  }
}
function MovieMZ_Token($n = 137)
{
  $t = intval($n * 24 * 3600) + time();
  return CreateWebToken('MovieMZ', $t);
}
function MovieMZ_Path($file, $t = "path")
{
  global $zbp;
  $result = $zbp->$t . "zb_users/plugin/MovieMZ/";
  switch ($file) {
    case "plugin":
      return $result . "var/plugin.js";
      break;
    case "u-normal":
      return $result . "usr/normal.js";
      break;
    case "v-normal":
      return $result . "var/normal.js";
      break;
    case "u-easy":
      return $result . "usr/easy.js";
      break;
    case "v-easy":
      return $result . "var/easy.js";
      break;
    case "cache":
      return $result . "cache/";
      break;
    case "main":
      return $result . "main.php";
      break;
    default:
      return $result . $file;
  }
}
function InstallPlugin_MovieMZ()
{
  $dir = MovieMZ_Path("cache");
  if (!is_dir($dir)) {
    @mkdir($dir, 0755);
    #code
  }
  $filesList = array("easy", "normal");
  foreach ($filesList as $key => $value) {
    $uFile = MovieMZ_Path("u-{$value}");
    $vFile = MovieMZ_Path("v-{$value}");
    if (!is_file($uFile)) {
      @mkdir(dirname($uFile));
      copy($vFile, $uFile);
    }
  }
}
function UninstallPlugin_MovieMZ()
{
}
