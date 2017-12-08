/*!
 * HTML5 Boilerplate | MIT (c) HTML5 Boilerplate
 * https://github.com/h5bp/html5-boilerplate
 *
 * ga-loader-snippets | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/ga-loader-snippets
*/

var parts = [
  '!function(A,B,C',
  '){A.GoogleAnalyticsObject=C;A[C]||(A[C]=function(){\n(A[C].q=A[C].q||[]).push(arguments)});A[C].l=+new Date',
  '=B.createElement(',
  '"//www.google-analytics.com/analytics.js"',
  '.parentNode.insertBefore(',
  '=B.getElementsByTagName(D)[0];',
  '(window,document,"ga"'
];

module.exports = {
  with3params: parts[0] + parts[1] + ';var s' + parts[2] + '"script"),\ne=B.scripts[0];s.src=' + parts[3] + ';\ne' + parts[4] + 's,e)}' + parts[6] + ');',
  with4params: parts[0] + ',D' + parts[1] + ';D' + parts[2] + '"script");\nvar e=B.scripts[0];D.src=' + parts[3] + ';\ne' + parts[4] + 'D,e)}' + parts[6] + ');',
  with5params: parts[0] + ',D,E' + parts[1] + ';D' + parts[2] + '"script");\nE=B.scripts[0];D.src=' + parts[3] + ';\nE' + parts[4] + 'D,E)}' + parts[6] + ');',
  with6params: parts[0] + ',D,E,F' + parts[1] + ';E' + parts[2] + 'D);\nF' + parts[5] + 'E.src=' + parts[3] + ';\nF' + parts[4] + 'E,F)}' + parts[6] + ',"script");',
  with7params: parts[0] + ',D,E,F,G' + parts[1] + ';F' + parts[2] + 'D);\nG' + parts[5] + 'F.src=E;G' + parts[4] + 'F,G)}\n' + parts[6] + ',"script",' + parts[3] + ');'
};
