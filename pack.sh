#!/bin/bash
out="pack.zip"
self=`basename "$0"`
rm -f $out && zip -r $out . -x $self .git/\* doc/\*
