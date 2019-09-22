
module TokenGenerator
  HumanTokenChars = 'acdefghjkmnpqrstuvwxyz234679'.split('')
  HexTokenChars = '0123456789abcdef'.split('')



  def self.human(len)
    self.generate(len, HumanTokenChars)
  end

  def self.hex(len)
    self.generate(len, HexTokenChars)
  end

  def self.generate(len, character_set)
    # note: use SecureRandom to ensure better randomness if that's needed
    charset_size = character_set.length
    len.times.map { character_set[rand(charset_size)] }.join('')
  end
end
