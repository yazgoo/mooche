require_relative 'parser'
part = "*i{T44sBb,C-7,C#o,Bb/D,|Bb,C-7,C#o,Bb/D,|Bb/D,Db-7,C-7,F7,|Bb/D,Db-7,C-7,F7,|lBb Bb7/Ab|Eb6/G Eb-6/Gb|Bb/F   |F7   }Y*A[Bb^7   |D7   |G7   | x |C7   |F7   |Bb^7/D C#o7|C-7 F7|Bb^7   |D7   |G7   | x |C7   |F7   |Bb^7 Eb6|Bb/F F7 Z"
part = "*A{T44C6 A-7|D-7 G7b13|lC^7 A-7|D-7 G7|E-7 A7|D-7 G7|N1C6 A-7|Ab7 G7 }       |N2C6 F-6|C6 A-7 ]*B[D-7 G7|C^7 A-7|F#h7 B7b9|E-7   |A-7 D7|G^7 E7b9|A-7 D7b9|D-7 G7 ]*A[C6 A-7|D-7 G7b13|lC^7 A-7|D-7 G7#9|E-7 A7|D-7 G7|C6 A-7|D-7 G7 Z"
part = "*A{T44F^7   |A-7 D7|G-7   |C7   |F7 D7|G7 C7|N1F6 D7|G-7 C7 }       |N2F6   |ppE7b9 ]*B[A-7   | x |Bh7   |E7b13   |Bh7   |E7b13   |A-7 D7|G-7 C7 ]*C[F^7   |A-7 D7|G-7   |C7   |F7 D7|G7 C7|F6   |G-7 C7 Z"
part = "*A{T44G-7   |Ah7 D7b9|   r|   |G-7   |Ah7 D7b9|N1G-7   |D7b9 G-7 }       |N2G-7   | x  ],*B,[C7   | x | x | x | x | x |Ah7   |D7b9   ],*A,[G-7   |Ah7 D7b9|   r|   |G-7   |Ah7 D7b9|G-7   | x  Z"
puts MMAParser.new(part).run

