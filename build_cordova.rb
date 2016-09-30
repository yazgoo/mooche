require 'fileutils'
require 'git'
require_relative 'version'
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

def setup_cordova_project(destination, mooche_revision, version, version_code)
    FileUtils.mkdir_p destination
    mooche_path = "#{destination}/mooche"
    Dir.chdir destination do
      puts `cordova create mooche org.mooche mooche`
      Dir.chdir mooche_path do
        replace_in_file "#{mooche_path}/config.xml", "index.html", 
          "yazgoo/mooche/#{mooche_revision}/index.html"
        replace_in_file "#{mooche_path}/config.xml", "</widget>", 
          '    <icon src="www/yazgoo/mooche/' + mooche_revision + '/favicon.png" />\n</widget>'
        replace_in_file "#{mooche_path}/config.xml", 'version="1.0.0"', 
          'version="'+version+'" android-versionCode="'+version_code+'"'
        puts `cordova platform add android`
        FileUtils.cp "#{ENV['HOME']}/.ssh/release-signing.properties", "#{mooche_path}/platforms/android/"
      end
    end
end

def build_cordova(destination)
    mooche_path = "#{destination}/mooche"
    Dir.chdir mooche_path do
        puts `cordova platform add browser`
        puts `cordova build android --release`
    end
end

setup_cordova_project destination, mooche_revision, Mooche.new.version, Mooche.new.version_code
install_source "#{destination}/mooche/www", mooche_revision
build_cordova destination
