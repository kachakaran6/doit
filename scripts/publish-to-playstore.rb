require 'googleauth'
require 'google/apis/androidpublisher_v3'

track_arg = ARGV[0] || 'alpha'
aab_path = ARGV[1] || 'K:/Doit/release-builds/DoIt-v0.2.9-build29.aab'
version_name = ARGV[2] || '0.2.9'
build_number = ARGV[3] || '29'

service = Google::Apis::AndroidpublisherV3::AndroidPublisherService.new
key_file = 'K:/Doit/apps/mobile/android/fastlane/api-key.json'
auth = Google::Auth::ServiceAccountCredentials.make_creds(
  json_key_io: File.open(key_file),
  scope: 'https://www.googleapis.com/auth/androidpublisher'
)
service.authorization = auth
pkg = 'com.samyukt.doit'

puts "=================================================="
puts "🚀 Uploading #{aab_path} to Google Play Console"
puts "   Track: #{track_arg}"
puts "   Version: #{version_name} (Build #{build_number})"
puts "=================================================="

edit = service.insert_edit(pkg, Google::Apis::AndroidpublisherV3::AppEdit.new)
puts "Edit ID: #{edit.id}"

res = service.upload_edit_bundle(
  pkg,
  edit.id,
  upload_source: aab_path,
  content_type: 'application/octet-stream'
)
puts "✅ Uploaded bundle versionCode: #{res.version_code}, SHA256: #{res.sha256}"

track = Google::Apis::AndroidpublisherV3::Track.new(
  track: track_arg,
  releases: [
    Google::Apis::AndroidpublisherV3::TrackRelease.new(
      name: "#{version_name} (#{build_number})",
      version_codes: [res.version_code.to_s],
      status: 'draft'
    )
  ]
)

service.update_edit_track(pkg, edit.id, track_arg, track)
commit_res = service.commit_edit(pkg, edit.id)
puts "🎉 SUCCESS! The release is committed to Google Play Console [#{track_arg}] track!"
