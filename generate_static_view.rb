require 'fileutils'
require 'git'
if ARGV.size < 2
  puts "Usage: #{$0} destination mooche-revision"
  exit
end
destination = ARGV[0]
mooche_revision = ARGV[1]

def replace_in_file(file_path, pattern, replacement)
    text = File.read(file_path)
    new_contents = text.gsub(pattern, replacement)
    File.open(file_path, "w") {|file| file.puts new_contents }
end

def install_source(destination, mooche_revision)
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
    replace_in_file file_path, /"\/yazgoo/, "\"../../../yazgoo"
  end
end

def setup_cordova_project(destination, mooche_revision)
    FileUtils.mkdir_p destination
    mooche_path = "#{destination}/mooche"
    Dir.chdir destination do
      puts `cordova create mooche org.mooche mooche`
      Dir.chdir mooche_path do
        replace_in_file "#{mooche_path}/config.xml", "index.html", 
          "yazgoo/mooche/#{mooche_revision}/index.html"
        puts `cordova platform add browser`
        puts `cordova platform add android`
      end
    end
end

setup_cordova_project destination, mooche_revision
install_source "#{destination}/mooche/www", mooche_revision
