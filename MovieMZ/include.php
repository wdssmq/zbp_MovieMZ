<?php
#注册插件
// require 'ParserDom.php';
RegisterPlugin("MovieMZ", "ActivePlugin_MovieMZ");
function ActivePlugin_MovieMZ()
{
  Add_Filter_Plugin('Filter_Plugin_Cmd_Ajax', 'MovieMZ_Ajax');
  Add_Filter_Plugin('Filter_Plugin_Edit_Begin', 'MovieMZ_SetHint');
  Add_Filter_Plugin('Filter_Plugin_Edit_Response2', 'MovieMZ_txt');
  Add_Filter_Plugin("Filter_Plugin_ViewPost_Template", 'MovieMZ_ViewPost');
}
function MovieMZ_ViewPost(&$template)
{
  global $zbp;
  $article = $template->GetTags('article');
  $article->Content = str_replace("<hr class='movie' />", "<hr class=\"movie\"/>", $article->Content);
  $array = explode("<hr class=\"movie\"/>", $article->Content);
  if (count($array) > 1) {
    $html = file_get_contents(MovieMZ_Path("w-html"));
    foreach ($array as $key => $value) {
      if ($key === 0) {
        $article->Content = $value;
        continue;
      }
      $html = str_replace("<!--movie-->", "{$value}<!--movie-->", $html);
    }
    $article->Content .= $html;
  }
  if (strpos($article->Content, "mmz-show") > 0) {
    $style = MovieMZ_Path("w-css", "host");
    $zbp->header .= "<link rel=\"stylesheet\" href=\"{$style}\">";
    $wJS = MovieMZ_Path("w-js", "host");
    $zbp->footer .= "<script src=\"{$wJS}\" type=\"text/javascript\"></script>";
    $article->Content = $article->Content;
  }
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
    $zbp->SetHint("tips", '电影信息生成：鉴权错误，请重新部署脚本或忽略本提示<a title="点击处理" href="' . MovieMZ_Path("main", "host") . '">点击处理</a>');
    @unlink(reset($logs));
  }
  if (count($files) > 0)
    $zbp->SetHint("tips", '电影信息生成：有未处理的抓取信息<a title="点击查看" href="javascript:;" onclick="MovieMZ_Slide()">点击查看</a>');
}
// function MovieMZ_Main()
// {


// }

function MovieMZ_txt()
{
  $read = MovieMZ_Path("read", "host");
  $read = "<a target=\"_blank\" href=\"{$read}\" title=\"#分享规范（如何判断片子质量）\">{$read}</a>";
  $bt = "http://test.wdssmq.com/bt2mag/";
  $bt = "<a target=\"_blank\" href=\"{$bt}\" title=\"种子转磁力链\">{$bt}</a>";
  $rss = "http://www.inoreader.com/bundle/0014cd6385f5";
  $rss = "<a target=\"_blank\" href=\"{$rss}\" title=\"RSS聚合\">{$rss}</a>";
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
      <textarea spellcheck="false" style="width: 98%;padding: 7px;" name="mmz-text" id="mmz-text" cols="30" rows="10" onmouseover="this.focus();">
      </textarea>
      <p>限特定格式的ed2k或磁力</p>
      <p><input class="button mmz-input" value="解析并插入" type="button" /><input class="button" onclick="$('#MovieMZ-Wraper').fadeOut();return false;" value="关闭" type="button" /></p>
      <p style="text-align: left;width: 75%;float: left;">
      参考：<br>
      1、磁力链生成：{$bt}; <br>
      2、资源命名规范：{$read}；<br>
      3、RSS订阅源组合包：{$rss}; <br>
      </p>
      <p style="text-align: right;width: 25%;float: left;padding-right: 5px;"><br><a href="javascript:;" title="保存" class="js-savCookie">将右侧信息设置为默认</a>→→<br><span class="js-lsCookie"></span></p>
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
    // Logs($str);
    $obj = json_decode($str);
    if (is_object($obj) && isset($obj->id)) {
      file_put_contents(MovieMZ_Path("cache") . "{$obj->id}.txt", $str);
      JsonReturn((object) array("id" => $obj->id));
    }
    die();
  } else if ($ID = GetVars("id", "GET")) {
    $file = MovieMZ_Path("cache/{$ID}.txt");
    @unlink($file);
    JsonReturn((object) array());
  } else {
    $files = GetFilesInDir(MovieMZ_Path("cache"), "txt");
    $array = array();
    foreach ($files as $id => $file) {
      $obj = json_decode(file_get_contents($file));
      $fileTime = filemtime($file);
      if (time() - $fileTime > 1123200) {
        @unlink($file);
        continue;
      }
      $obj->time = date("Ymd H:i", $fileTime);
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
      return $result . "script/plugin.js?v=2020-08-20";
      break;
    case "lock":
      return $result . "usr/lock.ini";
      break;
    case "w-css":
      return $result . "web/w_style.css?v=2020-08-20";
      break;
    case "w-js":
      return $result . "web/w_script.js?v=2020-08-20";
      break;
    case "w-html":
      return $result . "web/w_html.html";
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
    case "read":
      return $result . "read/read.html";
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
  $lock = MovieMZ_Path("lock");
  foreach ($filesList as $key => $value) {
    $uFile = MovieMZ_Path("u-{$value}");
    $vFile = MovieMZ_Path("v-{$value}");
    if (!is_file($lock) || !is_file($uFile)) {
      @mkdir(dirname($uFile));
      copy($vFile, $uFile);
    }
  }
}
function UninstallPlugin_MovieMZ()
{
}
