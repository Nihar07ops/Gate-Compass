$content = Get-Content testSessionService.property.test.ts -Raw
$content = $content -replace 'answers\[questionId\]\.selectedAnswer', 'answers[questionId].selected_answer'
$content = $content -replace 'answers\[questionId\]\.markedForReview', 'answers[questionId].marked_for_review'
Set-Content testSessionService.property.test.ts $content
