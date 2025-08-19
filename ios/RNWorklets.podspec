Pod::Spec.new do |s|
  s.name         = 'RNWorklets'
  s.version      = '0.0.1'
  s.summary      = 'Shim pod to satisfy RNReanimated dependency by referencing react-native-worklets-core.'
  s.homepage     = 'https://github.com/margelo/react-native-worklets-core'
  s.license      = { :type => 'MIT' }
  s.author       = { 'shim' => 'shim@example.com' }
  s.platforms    = { :ios => '11.0' }
  s.requires_arc = true
  s.source       = { :path => '.' }

  # Depend on the actual worklets core podspec located in node_modules
  s.dependency 'react-native-worklets-core'

  # Publish shim headers
  s.source_files = 'RNWorklets/include/**/*.{h,hpp}'
  s.public_header_files = 'RNWorklets/include/**/*.h'
  s.header_mappings_dir = 'RNWorklets/include'
end
