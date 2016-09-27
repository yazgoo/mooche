require 'fileutils'
require 'git'
if ARGV.size < 2
  puts "Usage: #{$0} destination mooche-revision"
  exit
end
destination = ARGV[0]
mooche_revision = ARGV[1]
referencing_files = ["index.html", "mooche.js"]
mooche_repository = ["/yazgoo/mooche", mooche_revision]
res = (referencing_files.map do |path| 
  File.open(path) { |f| f.each_line.map { |l| m = l.match(/(\/yazgoo\/[^\"\/]+)\/([^\"\/]+)\/[^\"\/]+/); m.nil? ? nil : [m[1], m[2]]} }.compact
end).flatten(1).uniq + [mooche_repository]

res.each do |path, commit|
  complete_path = destination + path
  FileUtils.mkdir_p complete_path
  Dir.chdir complete_path do
    puts complete_path
    git = Git.clone "git@github.com:#{path}.git", commit
    git.reset_hard commit
  end if not File.exists? (complete_path + "/" + commit)
end

referencing_files.each do |file_name|
  file_path = ([destination] + mooche_repository + [file_name]).join("/")
  text = File.read(file_path)
  new_contents = text.gsub(/"\/yazgoo/, "\"../../../yazgoo")
  File.open(file_path, "w") {|file| file.puts new_contents }
end
