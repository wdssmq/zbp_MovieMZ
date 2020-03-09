<?php
require '../../../zb_system/function/c_system_base.php';
require '../../../zb_system/function/c_system_admin.php';
$zbp->Load();
$action = 'root';
if (!$zbp->CheckRights($action)) {
  $zbp->ShowError(6);
  die();
}
if (!$zbp->CheckPlugin('MovieMZ')) {
  $zbp->ShowError(48);
  die();
}
InstallPlugin_MovieMZ();
$blogtitle = '电影信息生成';
require $blogpath . 'zb_system/admin/admin_header.php';
require $blogpath . 'zb_system/admin/admin_top.php';


$type = GetVars("type", "GET") === "easy" ? $type = GetVars("type", "GET") : "normal";

// $m = $type === "normal" ? array("m-now", "") : array("", "m-now");

$url = "{$zbp->host}zb_system/cmd.php?act=ajax&src=MovieMZ&token=" . MovieMZ_Token(59);
$edtUrl = "{$zbp->host}zb_system/cmd.php?act=ArticleEdt";
$js = file_get_contents(MovieMZ_Path("u-{$type}"));
$js = str_replace("-url-", $url, $js);
$js = str_replace("-edtUrl-", $edtUrl, $js);
?>
<div id="divMain">
  <div class="divHeader"><?php echo $blogtitle; ?></div>
  <div class="SubMenu">
    <?php echo MakeSubMenu("标准版", 'main.php', 'm-left ' . (GetVars('type') ? '' : 'm-now')); ?>
    <?php echo MakeSubMenu("简易版", 'main.php?type=easy', 'm-left ' . (GetVars('type') ? 'm-now' : '')); ?>
    <?php require_once "about.php"; ?>
  </div>
  <div id="divMain2">
  <p><b>以下代码仅限当前站点作者使用，请勿传播分享；</b><a target="_blank" href="doc/" title="点击查看使用说明">点击查看使用说明</a> - <a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=519cdb34bab5bccb8fbc36acb3400c5b2d00679ab8b3d9ab4fc385631c49a204"><img src="//pub.idqqimg.com/wpa/images/group.png" alt="我的咸鱼心" title="我的咸鱼心"></a></p>
  <textarea onmouseover="this.select();" onclick="that = this;setTimeout(function(){that.select()},150);" name="js" id="js" class="js" style="width: 90%; height: 600px" autocomplete="off" spellcheck="false"><?php echo $js; ?></textarea>
  <?php //echo zbpform::textarea("js", $js, "90%","600px"); ?>
  </div>

</div>
<script>
$(function () {
  let data = {js:$("#js").val()}
$("#js").change(function () {
  $(this).val(data.js);
});
});
</script>
<?php
require $blogpath . 'zb_system/admin/admin_footer.php';
RunTime();
?>
