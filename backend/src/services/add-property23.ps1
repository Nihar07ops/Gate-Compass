$content = Get-Content testSessionService.property.test.ts -Raw
$content = $content.TrimEnd()
$lastIndex = $content.LastIndexOf('});')
$before = $content.Substring(0, $lastIndex)
$addition = Get-Content property23-test-addition.txt -Raw
$final = $before + $addition
Set-Content testSessionService.property.test.ts $final
