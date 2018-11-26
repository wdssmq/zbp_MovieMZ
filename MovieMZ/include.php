<?php
#注册插件
// require 'ParserDom.php';
RegisterPlugin("MovieMZ", "ActivePlugin_MovieMZ");
if (!class_exists('ParserDom')) {
  require_once 'ParserDom.php';
  require_once 'ParserDom.php';
}
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
  echo '<div class="ui-draggable" id="MovieMZ-Box" style="display: none;position: absolute;">Loading</div>';
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
  $filesList = array("easy","normal");
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
