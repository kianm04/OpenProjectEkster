# frozen_string_literal: true

# When running under process managers like foreman/overmind, STDERR's pipe
# can break, causing Errno::EPIPE errors when anything tries to write to it.
#
# This initializer:
# 1. Ignores SIGPIPE signals (prevents process termination on broken pipes)
# 2. Wraps STDERR to catch any EPIPE exceptions that still occur

# Ignore SIGPIPE - when pipe breaks, we'll get EPIPE error instead of signal death
Signal.trap("PIPE", "IGNORE")

# Reopen STDERR to go through STDOUT (same pipe, less likely to break separately)
# This merges stderr into stdout which process managers handle better
if ENV["RAILS_ENV"] == "development" || ENV["RACK_ENV"] == "development"
  $stderr.reopen($stdout)
end
