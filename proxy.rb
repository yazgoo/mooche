require 'sinatra'
require 'net/http'
require 'uri'
forums = "http://www.irealb.com/forums"
get /(.*)/ do
  path = "#{forums}#{params["captures"].first}"
  path = path + "?" + request.query_string if request.query_string != ""
  puts path
  res = Net::HTTP.get_response(URI.parse(path))
  body = res.body.gsub(forums, "").gsub(/href=("irealb:\/\/[^"]+")/, " onclick='window.parent.postMessage(\\1, \"*\")'")
  [res.code.to_i, {'Content-Type' => res.to_hash["content-type"] , 'X-Frame-Options' => 'GOFORIT' }, body]
end
