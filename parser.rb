part = "{*AT44C9,   |Eb-6,   |C9,   |Eb-6   |Bb,   |sBb7,A7,Ab7,G7|N1lC9, F#o7,|C9, sAb7,G7}       |N2lC9, F#o7|lC9, sF7,Bb][*BlBb,   |Eb, Eb6|Eb6,   | x |G9,   |F, F6,|F9,   |  F7 ][*AC9,   |Eb-6,   |C9,   |Eb-6,   |Bb,   |sBb7,A7,Ab7,G7|lC9, F#o7 ,|sC6,F7,Bb,D9Z"
class Parser
  def initialize part
    notes = "A".ord.upto("G".ord).to_a.map { |x| x.chr }
    chord_modifiers = ["9", "b", "-", "6", "#", "b", "o", "a", "l", "t", "m", "1", "5", "7"]
    @parsed = []
    i = 0
    loop do
      break if i >= part.size
      c = part[i]
      if c == "{"
        @parsed << [:repeat_start]
      elsif c == "}"
        loop do 
          i += 1
          c = part[i] 
          if c != " "
            i -= 1
            break
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
        loop do 
          i += 1
          c = part[i] 
          if chord_modifiers.include? c
            chord += c
          else
            i -= 1
            break
          end
        end
        @parsed << [:chord, chord]
      elsif [","].include? c
        @parsed << [:coma]
      elsif [" "].include? c
        @parsed << [:space]
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
    @in_repeat_part = true
    "Repeat\n"
  end
  def tempo a, b
    "Groove Swing"
  end
  def start_part_end n
    "\n"
  end
  def repeat_end
    "\nRepeatEnding\n"
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
    add_up_bar_count + c.gsub("-", "m").gsub("o7", "mb5").gsub("o", "mb5")
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
result = MMAParser.new(part).run
puts result
