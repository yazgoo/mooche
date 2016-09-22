class Parser
  def initialize part
    notes = "A".ord.upto("G".ord).to_a.map { |x| x.chr }
    chord_modifiers = ["9", "b", "-", "6", "#", "b", "o", "a", "l", "t", "m", "1", "3", "5", "7", "/", "^"] + notes
    @parsed = []
    done = false
    i = 0
    while i < part.size
      c = part[i]
      if c == "{"
        @parsed << [:repeat_start]
      elsif c == "}"
        while ["}", " "].include?(c) do 
          i += 1
          c = part[i] 
          if c != " "
            i -= 1
          end
        end
        @parsed << [:repeat_end]
      elsif c == "]"
        @parsed << [:part_end]
      elsif c == '|'
        @parsed << [:bar]
      elsif c == 'x'
        @parsed << [:repeat_last_bar]
      elsif c == '*'
        i += 1
        c = part[i]
        @parsed << [:part, c]
      elsif c == 'T'
        i += 1
        t1 = part[i]
        i += 1
        t2 = part[i]
        @parsed << [:tempo, t1, t2]
      elsif c == 'N'
        i += 1
        t1 = part[i]
        @parsed << [:start_part_end, t1]
      elsif notes.include? c
        chord = c
        c = nil
        while ([nil] + chord_modifiers).include?(c) do 
          i += 1
          c = part[i] 
          if chord_modifiers.include? c
            chord += c
          else
            i -= 1
          end
        end
        @parsed << [:chord, chord]
      elsif [","].include? c
        @parsed << [:coma]
      elsif [" "].include? c
        @parsed << [:space] if not done
      elsif c == "Z"
        done = true
      else
        @parsed << [:unknown, c]
      end
      i += 1
    end
  end
  def run
    str = ""
    run_start
    @parsed.each do |item|
      str += send item[0], *item[1..-1] if respond_to? item[0]
    end
    str
  end
end
class MMAParser < Parser
  def run_start
    @bar_count = 0
    @first_chord_of_the_bar = true
    @in_repeat_part = false
  end
  def repeat_start
    "Repeat\n"
  end
  def tempo a, b
    "Groove Swing"
  end
  def start_part_end n
    @in_repeat_part = true
    "\n"
  end
  def repeat_end
    @first_chord_of_the_bar = true
    if @in_repeat_part
      @in_repeat_part = false
      "\nRepeatEnding\n"
    else
      "\nRepeatEnd\n"
    end
  end
  def part_end
    @first_chord_of_the_bar = true
    if @in_repeat_part
      @in_repeat_part = false
      "\nRepeatEnd\n"
    else
      ""
    end
  end
  def add_up_bar_count
    str = ""
    str = "\n#{@bar_count} " if @first_chord_of_the_bar
    @first_chord_of_the_bar = false
    str
  end
  def chord c
    add_up_bar_count + c.gsub("-", "m").gsub("^", "M").gsub("o7", "mb5").gsub("o", "mb5")
  end
  def space 
    add_up_bar_count + " / "
  end
  def  coma
    " "
  end
  def bar
    @first_chord_of_the_bar = true
    @bar_count += 1
    "\n"
  end
end
#result = MMAParser.new(part).run
#puts result
